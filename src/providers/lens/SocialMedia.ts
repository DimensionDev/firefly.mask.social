import {
    type ApprovedAllowanceAmountResultFragment,
    CommentRankingFilterType,
    CustomFiltersType,
    ExplorePublicationsOrderByType,
    FeedEventItemType,
    type FeeFollowModuleSettingsFragment,
    FollowModuleType,
    HiddenCommentsType,
    isCreateMomokaPublicationResult,
    isRelaySuccess,
    LimitType,
    OpenActionModuleType,
    ProfileReportingReason,
    ProfileReportingSpamSubreason,
    PublicationMetadataMainFocusType,
    PublicationReactionType,
    PublicationReportingReason,
    PublicationReportingSpamSubreason,
    PublicationType,
    ReferenceModuleType,
} from '@lens-protocol/client';
import {
    type MetadataAttribute,
    MetadataAttributeType,
    profile as createProfileMetadata,
} from '@lens-protocol/metadata';
import { t } from '@lingui/macro';
import { sendTransaction } from '@wagmi/core';
import { compact, first, flatMap, omit, uniq, uniqWith } from 'lodash-es';
import urlcat from 'urlcat';
import { v4 as uuid } from 'uuid';
import type { Address, Hex, TypedDataDomain } from 'viem';
import { polygon } from 'viem/chains';

import { config } from '@/configs/wagmiClient.js';
import { FireflyPlatform, Source, SourceInURL } from '@/constants/enum.js';
import { InvalidResultError, NotImplementedError } from '@/constants/error.js';
import { EMPTY_LIST, ORB_CLUB_TAG_PREFIX } from '@/constants/index.js';
import { SetQueryDataForActPost } from '@/decorators/SetQueryDataForActPost.js';
import { SetQueryDataForApprovalLensModule } from '@/decorators/SetQueryDataForApprovalLensModule.js';
import { SetQueryDataForBlockProfile } from '@/decorators/SetQueryDataForBlockProfile.js';
import { SetQueryDataForBookmarkPost } from '@/decorators/SetQueryDataForBookmarkPost.js';
import { SetQueryDataForCommentPost } from '@/decorators/SetQueryDataForCommentPost.js';
import { SetQueryDataForDeletePost } from '@/decorators/SetQueryDataForDeletePost.js';
import {
    SetQueryDataForFollowProfile,
    SetQueryDataForSuperFollowProfile,
} from '@/decorators/SetQueryDataForFollowProfile.js';
import { SetQueryDataForJoinChannel } from '@/decorators/SetQueryDataForJoinChannel.js';
import { SetQueryDataForLikePost } from '@/decorators/SetQueryDataForLikePost.js';
import { SetQueryDataForMirrorPost } from '@/decorators/SetQueryDataForMirrorPost.js';
import { SetQueryDataForPosts } from '@/decorators/SetQueryDataForPosts.js';
import { assertLensAccountOwner } from '@/helpers/assertLensAccountOwner.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import {
    filterFeeds,
    formatLensPost,
    formatLensPostByFeed,
    formatLensQuoteOrComment,
} from '@/helpers/formatLensPost.js';
import { formatLensProfile } from '@/helpers/formatLensProfile.js';
import { formatOrbClubToChannel } from '@/helpers/formatOrbClubToChannel.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getLensAllowanceModule } from '@/helpers/getLensAllowanceModule.js';
import { getOpenActionActOnKey } from '@/helpers/getOpenActionActOnKey.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSamePost } from '@/helpers/isSamePost.js';
import { isZero } from '@/helpers/number.js';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@/helpers/pageable.js';
import { retry } from '@/helpers/retry.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { waitUntilComplete } from '@/helpers/waitUntilComplete.js';
import { writeLensHubContract } from '@/helpers/writeLensHubContract.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { LensOpenRankProvider } from '@/providers/openrank/Lens.js';
import { OrbClubProvider } from '@/providers/orb/Club.js';
import {
    type LastLoggedInProfileRequest,
    profilesManagedQuery,
    type ProfilesManagedRequest,
} from '@/providers/types/LensGraphql/profileManagers.js';
import type { Club } from '@/providers/types/Orb.js';
import {
    type Channel,
    type Friendship,
    type Notification,
    NotificationType,
    type Post,
    type Profile,
    type ProfileBadge,
    type ProfileEditable,
    type Provider,
    ReactionType,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import { uploadLensMetadataToS3 } from '@/services/uploadLensMetadataToS3.js';
import type { ResponseJSON } from '@/types/index.js';

const MOMOKA_ERROR_MSG = 'momoka publication is not allowed';

@SetQueryDataForLikePost(Source.Lens)
@SetQueryDataForBookmarkPost(Source.Lens)
@SetQueryDataForMirrorPost(Source.Lens)
@SetQueryDataForCommentPost(Source.Lens)
@SetQueryDataForDeletePost(Source.Lens)
@SetQueryDataForBlockProfile(Source.Lens)
@SetQueryDataForFollowProfile(Source.Lens)
@SetQueryDataForSuperFollowProfile(Source.Lens)
@SetQueryDataForActPost(Source.Lens)
@SetQueryDataForPosts
@SetQueryDataForApprovalLensModule
@SetQueryDataForJoinChannel(Source.Lens)
export class LensSocialMedia implements Provider {
    get type() {
        return SessionType.Lens;
    }

    getFriendship(profileId: string): Promise<Friendship | null> {
        throw new NotImplementedError();
    }

    async getChannelById(channelId: string): Promise<Channel> {
        const profile = getCurrentProfile(Source.Lens);
        const response = await OrbClubProvider.fetchClubs({
            club_handle: channelId,
            profile_id: profile?.profileId,
        });

        if (response?.items.length) {
            return formatOrbClubToChannel(response.items[0]);
        }

        throw new Error(t`No channel found with the id ${channelId}`);
    }

    getChannelByHandle(channelHandle: string): Promise<Channel> {
        throw new NotImplementedError();
    }

    getChannelsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getPostsByChannelId(channelId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
            limit: LimitType.TwentyFive,
            where: { metadata: { tags: { oneOf: [`${ORB_CLUB_TAG_PREFIX}${channelId}`] } } },
        });

        return createPageable(
            filterFeeds(result.items).map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    getPostsByChannelHandle(channelHandle: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    async searchChannels(q: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        const response = await OrbClubProvider.fetchClubs({
            query: q || undefined,
            skip: indicator?.id ? +indicator.id : undefined,
        });

        return createPageable(
            response?.items.map(formatOrbClubToChannel) ?? EMPTY_LIST,
            createIndicator(indicator),
            response?.pageInfo.next ? createNextIndicator(indicator, response.pageInfo.next) : undefined,
        );
    }

    getChannelTrendingPosts(channel: Channel, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getLikedPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getReactors(postId: string): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    blockChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unblockChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getBlockedChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    getProfileBadges(profile: Profile): Promise<ProfileBadge[]> {
        throw new NotImplementedError();
    }

    async deletePost(postId: string): Promise<boolean> {
        const response = await lensSessionHolder.sdk.publication.hide({
            for: postId,
        });
        return response.isSuccess().valueOf();
    }

    async publishPost(post: Post): Promise<string> {
        if (!post.metadata.contentURI) throw new Error(t`No content to publish.`);

        if (post.author.signless) {
            const result = await lensSessionHolder.sdk.publication.postOnMomoka({
                contentURI: post.metadata.contentURI,
            });
            const resultValue = result.unwrap();

            if (result.isFailure() || resultValue.__typename === 'LensProfileManagerRelayError')
                throw new Error(`Something went wrong: ${JSON.stringify(resultValue)}`);

            return resultValue.id;
        } else {
            await assertLensAccountOwner();
            const walletClient = await getWalletClientRequired(config);

            const resultTypedData = await lensSessionHolder.sdk.publication.createMomokaPostTypedData({
                contentURI: post.metadata.contentURI,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Post',
                message: typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnMomoka({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }

            return broadcastValue.id;
        }
    }

    async mirrorPostOnMomoka(postId: string) {
        const result = await lensSessionHolder.sdk.publication.mirrorOnMomoka({
            mirrorOn: postId,
        });
        const resultValue = result.unwrap();

        if (!isCreateMomokaPublicationResult(resultValue)) {
            const walletClient = await getWalletClientRequired(config);
            const resultTypedData = await lensSessionHolder.sdk.publication.createMomokaMirrorTypedData({
                mirrorOn: postId,
            });
            const { id, typedData } = resultTypedData.unwrap();
            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Mirror',
                message: typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnMomoka({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }
        }
    }

    async mirrorPostOnChain(postId: string) {
        const result = await lensSessionHolder.sdk.publication.mirrorOnchain({
            mirrorOn: postId,
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            await assertLensAccountOwner();
            const walletClient = await getWalletClientRequired(config);

            const resultTypedData = await lensSessionHolder.sdk.publication.createOnchainMirrorTypedData({
                mirrorOn: postId,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Mirror',
                message: typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnchain({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }
        }
    }

    async mirrorPost(postId: string): Promise<string> {
        try {
            await this.mirrorPostOnMomoka(postId);
            return postId;
        } catch (error) {
            if (error instanceof Error && error.message.includes(MOMOKA_ERROR_MSG)) {
                await this.mirrorPostOnChain(postId);
                return postId;
            }
            throw error;
        }
    }

    async unmirrorPost(postId: string): Promise<void> {
        await lensSessionHolder.sdk.publication.hide({
            for: postId,
        });
    }

    async quotePostOnMomoka(postId: string, intro: string, signless?: boolean) {
        if (signless) {
            const result = await lensSessionHolder.sdk.publication.quoteOnMomoka({
                quoteOn: postId,
                contentURI: intro,
            });
            const resultValue = result.unwrap();

            if (result.isFailure() || resultValue.__typename === 'LensProfileManagerRelayError')
                throw new Error(`Something went wrong: ${JSON.stringify(resultValue)}`);

            return resultValue.id;
        } else {
            await assertLensAccountOwner();
            const walletClient = await getWalletClientRequired(config);

            const resultTypedData = await lensSessionHolder.sdk.publication.createMomokaQuoteTypedData({
                quoteOn: postId,
                contentURI: intro,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Quote',
                message: typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnMomoka({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }
            return broadcastValue.id;
        }
    }

    async quotePostOnChain(postId: string, intro: string) {
        const result = await lensSessionHolder.sdk.publication.quoteOnchain({
            quoteOn: postId,
            contentURI: intro,
        });

        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue) || !resultValue.txHash) {
            await assertLensAccountOwner();
            const walletClient = await getWalletClientRequired(config);

            const resultTypedData = await lensSessionHolder.sdk.publication.createOnchainQuoteTypedData({
                quoteOn: postId,
                contentURI: intro,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Quote',
                message: typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnchain({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError' || !broadcastValue.txHash) {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }

            const post = await this.getPostByTxHashWithPolling(broadcastValue.txHash);
            return post.postId;
        }

        const post = await this.getPostByTxHashWithPolling(resultValue.txHash);
        return post.postId;
    }

    // intro is the contentURI of the post
    async quotePost(postId: string, post: Post, signless?: boolean): Promise<string> {
        const intro = post.metadata.content?.content ?? '';
        try {
            const result = await this.quotePostOnMomoka(postId, intro, signless);
            return result;
        } catch (error) {
            if (error instanceof Error && error.message.includes(MOMOKA_ERROR_MSG)) {
                const result = await this.quotePostOnChain(postId, intro);
                return result;
            }
            throw error;
        }
    }

    async collectPost(postId: string): Promise<void> {
        const result = await lensSessionHolder.sdk.publication.bookmarks.add({
            on: postId,
        });

        if (result.isFailure()) throw new Error(`Something went wrong: ${JSON.stringify(result.isFailure())}`);
    }

    async actPost(
        postId: string,
        options: {
            type: OpenActionModuleType;
            signRequire?: boolean;
        },
    ) {
        const actWithSign = async () => {
            await assertLensAccountOwner();
            const walletClient = await getWalletClientRequired(config);

            const resultTypedData = await lensSessionHolder.sdk.publication.actions.createActOnTypedData({
                actOn: { [getOpenActionActOnKey(options.type)]: true },
                for: postId,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Act',
                message: typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnchain({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError' || !broadcastValue.txHash) {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }

            return waitUntilComplete(lensSessionHolder.sdk, broadcastValue.txHash);
        };

        if (!options.signRequire) {
            const result = await lensSessionHolder.sdk.publication.actions.actOn({
                actOn: { [getOpenActionActOnKey(options.type)]: true },
                for: postId,
            });

            const resultValue = result.unwrap();

            if (!isRelaySuccess(resultValue) || !resultValue.txHash) return actWithSign();

            return waitUntilComplete(lensSessionHolder.sdk, resultValue.txHash);
        }

        return actWithSign();
    }

    async commentPostOnMomoka(postId: string, comment: string, signless?: boolean) {
        if (signless) {
            const result = await lensSessionHolder.sdk.publication.commentOnMomoka({
                commentOn: postId,
                contentURI: comment,
            });
            const resultValue = result.unwrap();

            if (result.isFailure() || resultValue.__typename === 'LensProfileManagerRelayError')
                throw new Error(`Something went wrong: ${JSON.stringify(resultValue)}`);

            return resultValue.id;
        } else {
            await assertLensAccountOwner();
            const walletClient = await getWalletClientRequired(config);

            const resultTypedData = await lensSessionHolder.sdk.publication.createMomokaCommentTypedData({
                commentOn: postId,
                contentURI: comment,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Comment',
                message: typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnMomoka({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }
            return broadcastValue.id;
        }
    }

    async commentPostOnChain(postId: string, comment: string) {
        const result = await lensSessionHolder.sdk.publication.commentOnchain({
            commentOn: postId,
            contentURI: comment,
        });

        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue) || !resultValue.txHash) {
            await assertLensAccountOwner();
            const walletClient = await getWalletClientRequired(config);

            const resultTypedData = await lensSessionHolder.sdk.publication.createOnchainCommentTypedData({
                commentOn: postId,
                contentURI: comment,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Comment',
                message: typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnchain({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError' || !broadcastValue.txHash) {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }

            const post = await this.getPostByTxHashWithPolling(broadcastValue.txHash);
            return post.postId;
        }

        const post = await this.getPostByTxHashWithPolling(resultValue.txHash);
        return post.postId;
    }

    // comment is the contentURI of the post
    async commentPost(postId: string, post: Post, signless?: boolean): Promise<string> {
        const comment = post.metadata.content?.content ?? '';
        try {
            const result = await this.commentPostOnMomoka(postId, comment, signless);
            return result;
        } catch (error) {
            if (error instanceof Error && error.message.includes(MOMOKA_ERROR_MSG)) {
                const result = await this.commentPostOnChain(postId, comment);
                return result;
            }
            throw error;
        }
    }

    async upvotePost(postId: string) {
        const result = await lensSessionHolder.sdk.publication.reactions.add({
            for: postId,
            reaction: PublicationReactionType.Upvote,
        });

        if (result.isFailure()) throw new Error(`Something went wrong: ${JSON.stringify(result.isFailure())}`);
    }

    async unvotePost(postId: string): Promise<void> {
        const result = await lensSessionHolder.sdk.publication.reactions.remove({
            for: postId,
            reaction: PublicationReactionType.Upvote,
        });

        if (result.isFailure()) throw new Error(`Something went wrong: ${JSON.stringify(result.isFailure())}`);
    }

    async getProfilesByAddress(address: string): Promise<Profile[]> {
        const request: ProfilesManagedRequest | LastLoggedInProfileRequest = {
            for: address,
        };
        const {
            data: { lastLoggedInProfile },
        } = await profilesManagedQuery(request);
        const profiles = await lensSessionHolder.sdk.wallet.profilesManaged({ for: address });
        const result = profiles.items.map(formatLensProfile);
        const index = result.findIndex((profile) => profile.handle === lastLoggedInProfile?.handle?.fullHandle);
        if (index > -1) {
            const [value] = result.splice(index, 1);
            result.unshift(value);
        }
        return result;
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const result = await lensSessionHolder.sdk.profile.fetch({
            forProfileId: profileId,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getProfilesByIds(ids: string[]): Promise<Profile[]> {
        const result = await lensSessionHolder.sdk.profile.fetchAll({
            where: {
                profileIds: ids,
            },
        });
        const profiles = result.items.map(formatLensProfile);

        return profiles;
    }

    async getProfileByHandle(handle: string): Promise<Profile> {
        // Improve tolerance.
        if (handle.endsWith('.lens')) {
            handle = handle.slice(0, -5);
        }
        const result = await lensSessionHolder.sdk.profile.fetch({
            forHandle: `lens/${handle}`,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getPostById(postId: string): Promise<Post> {
        const result = await lensSessionHolder.sdk.publication.fetch({
            forId: postId,
        });
        if (!result) throw new Error(t`No post found`);

        const post = formatLensPost(result);
        return post;
    }

    async getPostByTxHashWithPolling(txHash: string): Promise<Post> {
        const getPostByTxHash = async (txHash: string): Promise<Post> => {
            const result = await lensSessionHolder.sdk.publication.fetch({
                forTxHash: txHash,
            });
            if (!result) throw new InvalidResultError();

            const post = formatLensPost(result);
            return post;
        };
        return retry(() => getPostByTxHash(txHash));
    }

    async getCommentsById(
        postId: string,
        indicator?: PageIndicator,
        hasFilter = true,
    ): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                commentOn: { id: postId, ranking: { filter: CommentRankingFilterType.Relevant } },
                customFilters: hasFilter ? [CustomFiltersType.Gardeners] : undefined,
            },
            limit: LimitType.TwentyFive,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        if (!result) throw new Error(t`No comments found`);

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getCommentsByProfileId(postId: string, profileId: string, indicator?: PageIndicator) {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                commentOn: { id: postId },
                from: [profileId],
            },
        });

        if (!result) throw new Error(t`No comments found`);

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensSessionHolder.sdk.explore.publications({
            orderBy: ExplorePublicationsOrderByType.LensCurated,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
            limit: LimitType.TwentyFive,
        });

        return createPageable(
            filterFeeds(result.items).map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async discoverPostsById(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const data = await lensSessionHolder.sdk.feed.fetch({
            where: {
                for: profileId,
                feedEventItemTypes: [FeedEventItemType.Post, FeedEventItemType.Comment, FeedEventItemType.Mirror],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        if (data.isFailure()) throw new Error(`Some thing went wrong ${JSON.stringify(data.isFailure())}`);

        const result = data.unwrap();

        return createPageable(
            compact(result.items.map(formatLensPostByFeed)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getCollectedPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                actedBy: profileId,
                publicationTypes: [PublicationType.Post, PublicationType.Comment, PublicationType.Mirror],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            uniqWith(result.items.map(formatLensPost), isSamePost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                from: [profileId],
                metadata: null,
                publicationTypes: [PublicationType.Post, PublicationType.Mirror, PublicationType.Quote],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getRepliesPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                from: [profileId],
                metadata: null,
                publicationTypes: [PublicationType.Comment],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getMediaPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                from: [profileId],
                metadata: {
                    mainContentFocus: [
                        PublicationMetadataMainFocusType.Image,
                        PublicationMetadataMainFocusType.Audio,
                        PublicationMetadataMainFocusType.Video,
                    ],
                },
                publicationTypes: [
                    PublicationType.Post,
                    PublicationType.Mirror,
                    PublicationType.Quote,
                    PublicationType.Comment,
                ],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    // TODO: Invalid
    async getPostsBeMentioned(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                from: [profileId],
            },
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsLiked(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                actedBy: profileId,
            },
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsReplies(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                from: [profileId],
                publicationTypes: [PublicationType.Comment],
            },
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                commentOn: {
                    id: postId,
                },
            },
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async follow(profileId: string): Promise<boolean> {
        const result = await lensSessionHolder.sdk.profile.follow({
            follow: [
                {
                    profileId,
                },
            ],
        });
        const resultValue = result.unwrap();
        if (!isRelaySuccess(resultValue)) {
            await assertLensAccountOwner();
            const result = await lensSessionHolder.sdk.profile.createFollowTypedData({
                follow: [
                    {
                        profileId,
                    },
                ],
            });

            const data = result.unwrap();
            const walletClient = await getWalletClientRequired(config, { chainId: polygon.id });

            const signedTypedData = await walletClient.signTypedData({
                domain: data.typedData.domain as TypedDataDomain,
                types: data.typedData.types,
                primaryType: 'Follow',
                message: data.typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnchain({
                id: data.id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();
            if (!isRelaySuccess(broadcastValue) || !broadcastValue.txHash) {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }

            await waitUntilComplete(lensSessionHolder.sdk, broadcastValue.txHash);
            return false;
        } else {
            await waitUntilComplete(lensSessionHolder.sdk, resultValue.txHash);
        }
        return true;
    }

    async superFollow(profileId: string): Promise<boolean> {
        const lensProfile = await lensSessionHolder.sdk.profile.fetch({
            forProfileId: profileId,
        });
        const followModule = lensProfile?.followModule as FeeFollowModuleSettingsFragment | null;

        if (!followModule) {
            throw new Error("No profile found or profile doesn't enable super follow");
        }

        const loggedInProfile = getCurrentProfile(Source.Lens);
        const currentProfile = await lensSessionHolder.sdk.profile.fetch({
            forProfileId: loggedInProfile?.profileId,
        });

        if (!currentProfile) {
            throw new Error('Failed to fetch current profile');
        }

        const sigNonces = await lensSessionHolder.sdk.wallet.sigNonces();

        if (!sigNonces?.isSuccess()) {
            throw new Error('Failed to fetch sig nonces');
        }

        const followTypedData = await lensSessionHolder.sdk.profile.createFollowTypedData(
            {
                follow: [
                    {
                        followModule: {
                            feeFollowModule: {
                                amount: {
                                    currency: followModule.amount.asset.contract.address,
                                    value: followModule.amount.value,
                                },
                            },
                        },
                        profileId,
                    },
                ],
            },
            { overrideSigNonce: sigNonces.unwrap().lensHubOnchainSigNonce },
        );

        if (!followTypedData?.isSuccess()) {
            throw new Error('Failed to create follow typed data');
        }

        const client = await getWalletClientRequired(config, { chainId: polygon.id });

        const { id, typedData } = followTypedData.unwrap();
        const { datas, followerProfileId, followTokenIds, idsOfProfilesToFollow } = typedData.value;
        const args = [followerProfileId, idsOfProfilesToFollow, followTokenIds, datas];

        if (currentProfile.sponsor) {
            const signature = await client.signTypedData({
                domain: omit(typedData.domain, ['__typename']) as Record<string, unknown>,
                message: omit(typedData.value, ['__typename']) as Record<string, unknown>,
                primaryType: Object.keys(omit(typedData.types, ['__typename']))[0],
                types: omit(typedData.types, ['__typename']) as Record<string, unknown>,
            });
            const broadcastData = await lensSessionHolder.sdk.transaction.broadcastOnchain({
                id,
                signature,
            });
            if (broadcastData?.unwrap()?.__typename === 'RelayError') {
                await writeLensHubContract('follow', args);
                return true;
            }

            return true;
        }

        await writeLensHubContract('follow', args);
        return true;
    }

    async unfollow(profileId: string): Promise<boolean> {
        const result = await lensSessionHolder.sdk.profile.unfollow({
            unfollow: [profileId],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            await assertLensAccountOwner();
            const followTypedDataResult = await lensSessionHolder.sdk.profile.createUnfollowTypedData({
                unfollow: [profileId],
            });

            const data = followTypedDataResult.unwrap();
            const client = await getWalletClientRequired(config, { chainId: polygon.id });

            const signedTypedData = await client.signTypedData({
                domain: data.typedData.domain as TypedDataDomain,
                types: data.typedData.types,
                primaryType: 'Unfollow',
                message: data.typedData.value,
            });

            const broadcastResult = await lensSessionHolder.sdk.transaction.broadcastOnchain({
                id: data.id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();
            if (!isRelaySuccess(broadcastValue) || !broadcastValue.txHash) {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }

            await waitUntilComplete(lensSessionHolder.sdk, broadcastValue.txHash);
            return false;
        } else {
            await waitUntilComplete(lensSessionHolder.sdk, resultValue.txHash);
        }
        return true;
    }

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await lensSessionHolder.sdk.profile.followers({
            of: profileId,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await lensSessionHolder.sdk.profile.following({
            for: profileId,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }
    async getMutualFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const observer = await lensSessionHolder.sdk.authentication.getProfileId();
        if (!observer || observer === profileId) return createPageable([], createIndicator(indicator));

        const result = await lensSessionHolder.sdk.profile.mutualFollowers({
            observer,
            viewing: profileId,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async isFollowedByMe(profileId: string): Promise<boolean> {
        const result = await lensSessionHolder.sdk.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowedByMe.value ?? false;
    }

    async isFollowingMe(profileId: string): Promise<boolean> {
        const result = await lensSessionHolder.sdk.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowingMe.value ?? false;
    }

    async getNotifications(
        indicator?: PageIndicator,
        highSignalFilter?: boolean,
    ): Promise<Pageable<Notification, PageIndicator>> {
        const response = await lensSessionHolder.sdk.notifications.fetch({
            where: {
                customFilters: [CustomFiltersType.Gardeners],
                highSignalFilter,
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const result = response.unwrap();

        const data = result.items.map<Notification | null>((item) => {
            if (item.__typename === 'MirrorNotification') {
                if (item.mirrors.length === 0) throw new Error('No mirror found');

                const time = first(item.mirrors)?.mirroredAt;
                return {
                    source: Source.Lens,
                    notificationId: item.id,
                    type: NotificationType.Mirror,
                    mirrors: item.mirrors.map((x) => formatLensProfile(x.profile)),
                    post: formatLensPost(item.publication),
                    timestamp: time ? new Date(time).getTime() : undefined,
                };
            }

            if (item.__typename === 'QuoteNotification') {
                const time = item.quote.createdAt;
                return {
                    source: Source.Lens,
                    notificationId: item.id,
                    type: NotificationType.Quote,
                    quote: formatLensPost(item.quote),
                    post: formatLensQuoteOrComment(item.quote.quoteOn),
                    timestamp: time ? new Date(time).getTime() : undefined,
                };
            }

            if (item.__typename === 'ReactionNotification') {
                if (item.reactions.length === 0) throw new Error('No reaction found');
                const time = first(flatMap(item.reactions.map((x) => x.reactions)))?.reactedAt;
                return {
                    source: Source.Lens,
                    notificationId: item.id,
                    type: NotificationType.Reaction,
                    reaction: ReactionType.Upvote,
                    reactors: item.reactions.map((x) => formatLensProfile(x.profile)),
                    post: formatLensPost(item.publication),
                    timestamp: time ? new Date(time).getTime() : undefined,
                };
            }

            if (item.__typename === 'CommentNotification') {
                return {
                    source: Source.Lens,
                    notificationId: item.id,
                    type: NotificationType.Comment,
                    comment: formatLensPost(item.comment),
                    post: formatLensQuoteOrComment(item.comment.commentOn),
                    timestamp: new Date(item.comment.createdAt).getTime(),
                };
            }

            if (item.__typename === 'FollowNotification') {
                if (item.followers.length === 0) throw new Error('No follower found');

                return {
                    source: Source.Lens,
                    notificationId: item.id,
                    type: NotificationType.Follow,
                    followers: item.followers.map(formatLensProfile),
                };
            }

            if (item.__typename === 'MentionNotification') {
                const post = formatLensPost(item.publication);

                return {
                    source: Source.Lens,
                    notificationId: item.id,
                    type: NotificationType.Mention,
                    post,
                    timestamp: new Date(item.publication.createdAt).getTime(),
                };
            }

            if (item.__typename === 'ActedNotification') {
                const time = first(item.actions)?.actedAt;
                return {
                    source: Source.Lens,
                    notificationId: item.id,
                    type: NotificationType.Act,
                    post: formatLensPost(item.publication),
                    actions: item.actions.map((x) => formatLensProfile(x.by)),
                    timestamp: time ? new Date(time).getTime() : undefined,
                };
            }

            return null;
        });

        // filter muted/blocked items
        const profileIds = compact(
            data.flatMap((x) => {
                if (!x) return null;
                if ('followers' in x) return x.followers.map((follower) => follower.profileId);
                if ('mirrors' in x) return x.mirrors.map((mirror) => mirror.profileId);
                if ('reactors' in x) return x.reactors.map((reactor) => reactor.profileId);
                return x?.post?.author.profileId;
            }),
        );
        const blockList = await FireflyEndpointProvider.getBlockRelation(
            profileIds.map((snsId) => ({ snsId, snsPlatform: FireflyPlatform.Lens })),
        );

        const profileIdSet = new Set(blockList.filter((x) => x.blocked).map((x) => x.snsId));

        const items = compact(data)
            .map((item) => {
                if (!item) return item;
                if ('followers' in item) {
                    item.followers = item.followers.filter((x) => !profileIdSet.has(x.profileId));
                }
                if ('mirrors' in item) {
                    item.mirrors = item.mirrors.filter((x) => !profileIdSet.has(x.profileId));
                }
                if ('reactors' in item) {
                    item.reactors = item.reactors.filter((x) => !profileIdSet.has(x.profileId));
                }
                return item;
            })
            .filter((item) => {
                if (!item) return false;
                if ('followers' in item && item.followers.length <= 0) return false;
                if ('mirrors' in item && item.mirrors.length <= 0) return false;
                if ('reactors' in item && item.reactors.length <= 0) return false;
                if ('post' in item && item.post?.author.profileId && profileIdSet.has(item.post.author.profileId)) {
                    return false;
                }
                if (
                    'comment' in item &&
                    item.comment?.author.profileId &&
                    profileIdSet.has(item.comment.author.profileId)
                ) {
                    return false;
                }
                if ('quote' in item && item.quote?.author.profileId && profileIdSet.has(item.quote.author.profileId)) {
                    return false;
                }
                return true;
            });

        return createPageable(
            items,
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const response = await FireflyEndpointProvider.getLensSuggestFollows(indicator);
        const result = await lensSessionHolder.sdk.profile.fetchAll({
            where: {
                profileIds: response.data.map((profile) => profile.profileId),
            },
        });
        if (!result) return createPageable(EMPTY_LIST, createIndicator(indicator));
        response.data = result.items.map(formatLensProfile);
        return response;
    }

    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const result = await lensSessionHolder.sdk.search.profiles({
            query: q,
            cursor: indicator?.id,
            limit: LimitType.TwentyFive,
            where: {
                // hey.xyz passes such filters for its searching as well
                customFilters: [CustomFiltersType.Gardeners],
            },
        });
        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensSessionHolder.sdk.search.publications({
            query: q,
            cursor: indicator?.id,
            limit: LimitType.TwentyFive,
        });
        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getThreadByPostId(postId: string) {
        const response = await fetchJSON<ResponseJSON<string[]>>(urlcat('/api/thread', { id: postId }));
        if (!response.success) return EMPTY_LIST;
        const posts = await lensSessionHolder.sdk.publication.fetchAll({
            limit: LimitType.TwentyFive,
            where: {
                publicationIds: [postId, ...response.data],
            },
        });

        return posts.items.map(formatLensPost);
    }

    async blockProfile(profileId: string) {
        const result = await FireflyEndpointProvider.blockProfileFor(FireflyPlatform.Lens, profileId);
        await runInSafeAsync(() =>
            lensSessionHolder.sdk.profile.block({
                profiles: [profileId],
            }),
        );
        return result;
    }

    async unblockProfile(profileId: string) {
        const result = await FireflyEndpointProvider.unblockProfileFor(FireflyPlatform.Lens, profileId);
        await runInSafeAsync(() =>
            lensSessionHolder.sdk.profile.unblock({
                profiles: [profileId],
            }),
        );
        return result;
    }

    async getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return FireflySocialMediaProvider.getBlockedProfiles(indicator, SourceInURL.Lens);
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator) {
        const result = await lensSessionHolder.sdk.publication.reactions.fetch({
            cursor: indicator?.id ? indicator.id : undefined,
            // TODO could be just publicationId as the typing
            for: postId,
            where: {
                anyOf: [PublicationReactionType.Upvote],
            },
        });
        if (!result) throw new Error(t`No one likes this post yet.`);
        const profiles = result.items.map((item) => formatLensProfile(item.profile));
        return createPageable(
            profiles,
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }
    async getRepostReactors(postId: string, indicator?: PageIndicator) {
        const result = await lensSessionHolder.sdk.profile.fetchAll({
            cursor: indicator?.id ? indicator.id : undefined,
            where: {
                whoMirroredPublication: postId,
            },
        });
        if (!result) throw new Error(t`No one likes this post yet.`);
        const profiles = result.items.map(formatLensProfile);
        return createPageable(
            profiles,
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsQuoteOn(postId: string, indicator?: PageIndicator) {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            cursor: indicator?.id ? indicator.id : undefined,
            where: {
                quoteOn: postId,
            },
        });
        if (!result) throw new Error(t`No one likes this post yet.`);
        const posts = result.items.map(formatLensPost);
        return createPageable(
            posts,
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }
    async bookmark(postId: string): Promise<boolean> {
        const result = await lensSessionHolder.sdk.publication.bookmarks.add({ on: postId });
        return result.isSuccess();
    }

    async unbookmark(postId: string): Promise<boolean> {
        const result = await lensSessionHolder.sdk.publication.bookmarks.remove({ on: postId });
        return result.isSuccess();
    }

    async getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensSessionHolder.sdk.publication.bookmarks.fetch({
            cursor: indicator?.id ? indicator.id : undefined,
        });
        if (result.isSuccess()) {
            const value = result.value;
            value.items.map(formatLensPost);
            const profiles = value.items.map(formatLensPost);
            return createPageable(
                profiles,
                createIndicator(indicator),
                value.pageInfo.next ? createNextIndicator(indicator, value.pageInfo.next) : undefined,
            );
        }
        throw new Error('Failed to fetch bookmarks');
    }

    async getHiddenComments(postId: string, indicator?: PageIndicator) {
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            limit: LimitType.TwentyFive,
            where: {
                commentOn: {
                    hiddenComments: HiddenCommentsType.Hide,
                    id: postId,
                    ranking: {
                        filter: CommentRankingFilterType.NoneRelevant,
                    },
                },
                customFilters: [CustomFiltersType.Gardeners],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        if (!result) throw new Error(t`No comments found`);

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async reportProfile(profileId: string) {
        const result = await lensSessionHolder.sdk.profile.report({
            for: profileId,
            // TODO more specific and accurate reason.
            reason: {
                spamReason: {
                    reason: ProfileReportingReason.Spam,
                    subreason: ProfileReportingSpamSubreason.SomethingElse,
                },
            },
        });
        return result.isSuccess().valueOf();
    }

    async reportPost(post: Post) {
        const postId = post.postId;
        const result = await lensSessionHolder.sdk.publication.report({
            for: postId,
            // TODO more specific and accurate reason.
            reason: {
                spamReason: {
                    reason: PublicationReportingReason.Spam,
                    subreason: PublicationReportingSpamSubreason.SomethingElse,
                },
            },
        });
        const success = result.isSuccess().valueOf();
        // Also report to Firefly
        if (success) {
            return FireflySocialMediaProvider.reportPost(post);
        }
        return success;
    }

    async getRecentPosts(indicator?: PageIndicator) {
        const offset = parseInt(indicator?.id ?? '0', 10) || 0;
        const limit = 50;
        const items = await LensOpenRankProvider.feed('recent', {
            offset,
            limit,
        });
        const result = await lensSessionHolder.sdk.publication.fetchAll({
            where: {
                publicationIds: uniq(items.map((x) => x.postId)),
            },
        });
        if (!result) createPageable(EMPTY_LIST, undefined);

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            createNextIndicator(indicator, `${offset + limit}`),
        );
    }
    async updateProfile(profile: ProfileEditable): Promise<boolean> {
        const attributes: MetadataAttribute[] = compact([
            profile.website ? { type: MetadataAttributeType.STRING, key: 'website', value: profile.website } : null,
            profile.location ? { type: MetadataAttributeType.STRING, key: 'location', value: profile.location } : null,
        ]);
        const metadata = createProfileMetadata({
            id: uuid(),
            name: profile.displayName,
            bio: profile.bio,
            picture: profile.pfp,
            attributes: attributes.length ? attributes : undefined,
        });
        const metadataURI = await uploadLensMetadataToS3(metadata);
        const result = await lensSessionHolder.sdk.profile.setProfileMetadata({
            metadataURI,
        });
        return result.isSuccess();
    }

    async queryApprovedModuleAllowanceData(
        spender: string,
        openAction?: OpenActionModuleType,
        follow?: FollowModuleType,
        reference?: ReferenceModuleType,
    ) {
        const result = await lensSessionHolder.sdk.modules.approvedAllowanceAmount({
            currencies: [spender],
            followModules: compact([follow]),
            openActionModules: compact([openAction]),
            referenceModules: compact([reference]),
        });

        return result.unwrap();
    }

    async approveModuleAllowance(
        module: ApprovedAllowanceAmountResultFragment,
        amount: string,
        currencyAddress?: string,
    ) {
        const moduleName = module.moduleName;
        const contract = currencyAddress ?? module.allowance.asset.contract.address;
        const isUnknownModule = moduleName === OpenActionModuleType.UnknownOpenActionModule;
        const fieldKey = isUnknownModule ? 'unknownOpenActionModule' : getLensAllowanceModule(moduleName).field;

        const data = await lensSessionHolder.sdk.modules.generateCurrencyApprovalData({
            allowance: { currency: contract, value: amount },
            module: {
                [fieldKey]: isUnknownModule ? module.moduleContract.address : moduleName,
            },
        });

        if (!data?.isSuccess()) {
            throw new Error('Failed to generate approval data');
        }

        await getWalletClientRequired(config, { chainId: polygon.id });

        const approvalData = data.unwrap();
        const hash = await sendTransaction(config, {
            account: approvalData.from as Address,
            data: approvalData.data as Hex,
            to: approvalData.to as Address,
        });

        await waitForEthereumTransaction(polygon.id, hash);
    }

    async joinChannel(channel: Channel): Promise<boolean> {
        const club = channel.__original__ as Club;
        if (!club?.id) {
            throw new Error('Invalid channel to join');
        }

        return await OrbClubProvider.joinClub(club.id);
    }

    async leaveChannel(channel: Channel): Promise<boolean> {
        const club = channel.__original__ as Club;
        if (!club?.id) {
            throw new Error('Invalid channel to join');
        }

        return await OrbClubProvider.leaveClub(club.id);
    }

    async getPinnedPost(profileId: string): Promise<Post> {
        throw new NotImplementedError();
    }
}

export const LensSocialMediaProvider = new LensSocialMedia();
