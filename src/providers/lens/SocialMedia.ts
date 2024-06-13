import {
    CommentRankingFilterType,
    CustomFiltersType,
    ExploreProfilesOrderByType,
    ExplorePublicationsOrderByType,
    FeedEventItemType,
    HiddenCommentsType,
    isCreateMomokaPublicationResult,
    isRelaySuccess,
    LimitType,
    ProfileReportingReason,
    ProfileReportingSpamSubreason,
    PublicationMetadataMainFocusType,
    PublicationReactionType,
    PublicationReportingReason,
    PublicationReportingSpamSubreason,
    PublicationType,
} from '@lens-protocol/client';
import { t } from '@lingui/macro';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { isZero } from '@masknet/web3-shared-base';
import { compact, first, flatMap, uniqWith } from 'lodash-es';
import urlcat from 'urlcat';
import type { TypedDataDomain } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { Source } from '@/constants/enum.js';
import { InvalidResultError } from '@/constants/error.js';
import { SetQueryDataForBlockProfile } from '@/decorators/SetQueryDataForBlockProfile.js';
import { SetQueryDataForBookmarkPost } from '@/decorators/SetQueryDataForBookmarkPost.js';
import { SetQueryDataForCommentPost } from '@/decorators/SetQueryDataForCommentPost.js';
import { SetQueryDataForDeletePost } from '@/decorators/SetQueryDataForDeletePost.js';
import { SetQueryDataForFollowProfile } from '@/decorators/SetQueryDataForFollowProfile.js';
import { SetQueryDataForLikePost } from '@/decorators/SetQueryDataForLikePost.js';
import { SetQueryDataForMirrorPost } from '@/decorators/SetQueryDataForMirrorPost.js';
import { SetQueryDataForPosts } from '@/decorators/SetQueryDataForPosts.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatLensPost, formatLensPostByFeed, formatLensQuoteOrComment } from '@/helpers/formatLensPost.js';
import { formatLensProfile } from '@/helpers/formatLensProfile.js';
import { formatLensSuggestedFollowUserProfile } from '@/helpers/formatLensSuggestedFollowUserProfile.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSamePost } from '@/helpers/isSamePost.js';
import { pollWithRetry } from '@/helpers/pollWithRetry.js';
import { waitUntilComplete } from '@/helpers/waitUntilComplete.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import {
    type LastLoggedInProfileRequest,
    profilesManagedQuery,
    type ProfilesManagedRequest,
} from '@/providers/types/LensGraphql/profileManagers.js';
import {
    type Channel,
    type Notification,
    NotificationType,
    type Post,
    type Profile,
    type Provider,
    ReactionType,
    SessionType,
    type SuggestedFollowUserProfile,
} from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

const MOMOKA_ERROR_MSG = 'momoka publication is not allowed';

@SetQueryDataForLikePost(Source.Lens)
@SetQueryDataForBookmarkPost(Source.Lens)
@SetQueryDataForMirrorPost(Source.Lens)
@SetQueryDataForCommentPost(Source.Lens)
@SetQueryDataForDeletePost(Source.Lens)
@SetQueryDataForBlockProfile(Source.Lens)
@SetQueryDataForFollowProfile(Source.Lens)
@SetQueryDataForPosts
class LensSocialMedia implements Provider {
    getChannelById(channelId: string): Promise<Channel> {
        throw new Error('Method not implemented.');
    }

    getChannelByHandle(channelHandle: string): Promise<Channel> {
        throw new Error('Method not implemented.');
    }

    getChannelsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByChannelId(channelId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByChannelHandle(channelHandle: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    searchChannels(q: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async deletePost(postId: string): Promise<boolean> {
        const response = await lensSessionHolder.sdk.publication.hide({
            for: postId,
        });
        return response.isSuccess().valueOf();
    }

    get type() {
        return SessionType.Lens;
    }

    getAccessToken() {
        return lensSessionHolder.sdk.authentication.getAccessToken();
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

    async getProfileByHandle(handle: string): Promise<Profile> {
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
        return pollWithRetry(() => getPostByTxHash(txHash));
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
            result.items.map(formatLensPost),
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
            result.items.map(formatLensPostByFeed),
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

    async getLikedPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
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

    getReactors!: (postId: string) => Promise<Pageable<Profile>>;

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
            const result = await lensSessionHolder.sdk.profile.createFollowTypedData({
                follow: [
                    {
                        profileId,
                    },
                ],
            });

            const data = result.unwrap();
            const walletClient = await getWalletClientRequired(config);
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

    async unfollow(profileId: string): Promise<boolean> {
        const result = await lensSessionHolder.sdk.profile.unfollow({
            unfollow: [profileId],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            const followTypedDataResult = await lensSessionHolder.sdk.profile.createUnfollowTypedData({
                unfollow: [profileId],
            });

            const data = followTypedDataResult.unwrap();
            const client = await getWalletClientRequired(config);
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

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const response = await lensSessionHolder.sdk.notifications.fetch({
            where: {
                customFilters: [CustomFiltersType.Gardeners],
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

        return createPageable(
            compact(data),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await lensSessionHolder.sdk.explore.profiles({
            orderBy: ExploreProfilesOrderByType.MostFollowers,
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
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
        const result = await lensSessionHolder.sdk.profile.block({
            profiles: [profileId],
        });
        return result.isSuccess().valueOf();
    }

    async unblockProfile(profileId: string) {
        const result = await lensSessionHolder.sdk.profile.unblock({
            profiles: [profileId],
        });
        return result.isSuccess().valueOf();
    }

    async getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const result = await lensSessionHolder.sdk.profile.whoHaveBeenBlocked({
            cursor: indicator?.id,
            limit: LimitType.TwentyFive,
        });
        if (!result.isSuccess()) {
            throw new Error('Failed to fetch blocked profiles');
        }

        const wrappedResult = result.unwrap();

        return createPageable(
            wrappedResult.items.map(formatLensProfile),
            createIndicator(indicator),
            wrappedResult.pageInfo.next ? createNextIndicator(indicator, wrappedResult.pageInfo.next) : undefined,
        );
    }

    async blockChannel(channelId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async unblockChannel(channelId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async getBlockedChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
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
        const reported = result.isSuccess().valueOf();
        if (!reported) return false;
        const blocked = await this.blockProfile(profileId);

        return blocked;
    }
    async reportPost(postId: string) {
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
        return result.isSuccess().valueOf();
    }

    async getSuggestedFollowUsers({
        indicator,
    }: {
        indicator?: PageIndicator;
    } = {}): Promise<Pageable<SuggestedFollowUserProfile, PageIndicator>> {
        const result = await lensSessionHolder.sdk.explore.profiles({
            orderBy: ExploreProfilesOrderByType.MostFollowers,
        });

        if (!result) throw new Error(t`No comments found`);

        return createPageable(
            result.items.map(formatLensSuggestedFollowUserProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }
}

export const LensSocialMediaProvider = new LensSocialMedia();
