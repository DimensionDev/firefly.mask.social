import {
    CommentRankingFilterType,
    CustomFiltersType,
    ExploreProfilesOrderByType,
    ExplorePublicationsOrderByType,
    FeedEventItemType,
    isCreateMomokaPublicationResult,
    isRelaySuccess,
    LimitType,
    PublicationMetadataMainFocusType,
    PublicationReactionType,
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
import { first, flatMap, uniqWith } from 'lodash-es';
import urlcat from 'urlcat';
import type { TypedDataDomain } from 'viem';
import { polygon } from 'viem/chains';

import { lensClient } from '@/configs/lensClient.js';
import { config } from '@/configs/wagmiClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SetQueryDataForCommentPost } from '@/decorators/SetQueryDataForCommentPost.js';
import { SetQueryDataForDeletePost } from '@/decorators/SetQueryDataForDeletePost.js';
import { SetQueryDataForLikePost } from '@/decorators/SetQueryDataForLikePost.js';
import { SetQueryDataForMirrorPost } from '@/decorators/SetQueryDataForMirrorPost.js';
import { SetQueryDataForPosts } from '@/decorators/SetQueryDataForPosts.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatLensPost, formatLensPostByFeed, formatLensQuoteOrComment } from '@/helpers/formatLensPost.js';
import { formatLensProfile } from '@/helpers/formatLensProfile.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { pollingWithRetry } from '@/helpers/pollWithRetry.js';
import { waitUntilComplete } from '@/helpers/waitUntilComplete.js';
import { LensSession } from '@/providers/lens/Session.js';
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
} from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

const MOMOKA_ERROR_MSG = 'momoka publication is not allowed';

@SetQueryDataForLikePost(SocialPlatform.Lens)
@SetQueryDataForMirrorPost(SocialPlatform.Lens)
@SetQueryDataForCommentPost(SocialPlatform.Lens)
@SetQueryDataForDeletePost(SocialPlatform.Lens)
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

    deletePost(postId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    get type() {
        return SessionType.Lens;
    }

    getAccessToken() {
        return lensClient.sdk.authentication.getAccessToken();
    }

    async createSessionForProfileId(profileId: string): Promise<LensSession> {
        const walletClient = await getWalletClientRequired(config, {
            chainId: polygon.id,
        });
        const { id, text } = await lensClient.sdk.authentication.generateChallenge({
            for: profileId,
            signedBy: walletClient.account.address,
        });
        const signature = await walletClient.signMessage({
            message: text,
        });

        await lensClient.sdk.authentication.authenticate({
            id,
            signature,
        });

        const now = Date.now();
        const accessToke = await lensClient.sdk.authentication.getAccessToken();

        return new LensSession(
            profileId,
            accessToke.unwrap(),
            now,
            now + 1000 * 60 * 60 * 24 * 30, // 30 days
        );
    }

    async updateSignless(enable: boolean): Promise<void> {
        const typedDataResult = await lensClient.sdk.profile.createChangeProfileManagersTypedData({
            approveSignless: enable,
        });

        const { id, typedData } = typedDataResult.unwrap();
        const walletClient = await getWalletClientRequired(config);
        const signedTypedData = await walletClient.signTypedData({
            domain: typedData.domain as TypedDataDomain,
            types: typedData.types,
            primaryType: 'ChangeDelegatedExecutorsConfig',
            message: typedData.value,
        });

        const broadcastOnchainResult = await lensClient.sdk.transaction.broadcastOnchain({
            id,
            signature: signedTypedData,
        });

        const onchainRelayResult = broadcastOnchainResult.unwrap();

        if (onchainRelayResult.__typename === 'RelayError') {
            // TODO: read error message from onchainRelayResult and show it to user
            console.warn("Couldn't update signless", onchainRelayResult);
            throw new Error("Couldn't update signless");
        }
        return;
    }

    async publishPost(post: Post): Promise<string> {
        if (!post.metadata.contentURI) throw new Error(t`No content to publish.`);

        if (post.author.signless) {
            const result = await lensClient.sdk.publication.postOnMomoka({
                contentURI: post.metadata.contentURI,
            });
            const resultValue = result.unwrap();

            if (result.isFailure() || resultValue.__typename === 'LensProfileManagerRelayError')
                throw new Error(`Something went wrong: ${JSON.stringify(resultValue)}`);

            return resultValue.id;
        } else {
            const walletClient = await getWalletClientRequired(config);
            const resultTypedData = await lensClient.sdk.publication.createMomokaPostTypedData({
                contentURI: post.metadata.contentURI,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Post',
                message: typedData.value,
            });

            const broadcastResult = await lensClient.sdk.transaction.broadcastOnMomoka({
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
        const result = await lensClient.sdk.publication.mirrorOnMomoka({
            mirrorOn: postId,
        });
        const resultValue = result.unwrap();

        if (!isCreateMomokaPublicationResult(resultValue)) {
            const walletClient = await getWalletClientRequired(config);
            const resultTypedData = await lensClient.sdk.publication.createMomokaMirrorTypedData({
                mirrorOn: postId,
            });
            const { id, typedData } = resultTypedData.unwrap();
            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Mirror',
                message: typedData.value,
            });

            const broadcastResult = await lensClient.sdk.transaction.broadcastOnMomoka({
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
        const result = await lensClient.sdk.publication.mirrorOnchain({
            mirrorOn: postId,
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            const walletClient = await getWalletClientRequired(config);
            const resultTypedData = await lensClient.sdk.publication.createOnchainMirrorTypedData({
                mirrorOn: postId,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Mirror',
                message: typedData.value,
            });

            const broadcastResult = await lensClient.sdk.transaction.broadcastOnchain({
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
            const result = await lensClient.sdk.publication.quoteOnMomoka({
                quoteOn: postId,
                contentURI: intro,
            });
            const resultValue = result.unwrap();

            if (result.isFailure() || resultValue.__typename === 'LensProfileManagerRelayError')
                throw new Error(`Something went wrong: ${JSON.stringify(resultValue)}`);

            return resultValue.id;
        } else {
            const walletClient = await getWalletClientRequired(config);
            const resultTypedData = await lensClient.sdk.publication.createMomokaQuoteTypedData({
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

            const broadcastResult = await lensClient.sdk.transaction.broadcastOnMomoka({
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
        const result = await lensClient.sdk.publication.quoteOnchain({
            quoteOn: postId,
            contentURI: intro,
        });

        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue) || !resultValue.txHash) {
            const walletClient = await getWalletClientRequired(config);

            const resultTypedData = await lensClient.sdk.publication.createOnchainQuoteTypedData({
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

            const broadcastResult = await lensClient.sdk.transaction.broadcastOnchain({
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
        const result = await lensClient.sdk.publication.bookmarks.add({
            on: postId,
        });

        if (result.isFailure()) throw new Error(`Something went wrong: ${JSON.stringify(result.isFailure())}`);
    }

    async commentPostOnMomoka(postId: string, comment: string, signless?: boolean) {
        if (signless) {
            const result = await lensClient.sdk.publication.commentOnMomoka({
                commentOn: postId,
                contentURI: comment,
            });
            const resultValue = result.unwrap();

            if (result.isFailure() || resultValue.__typename === 'LensProfileManagerRelayError')
                throw new Error(`Something went wrong: ${JSON.stringify(resultValue)}`);

            return resultValue.id;
        } else {
            const walletClient = await getWalletClientRequired(config);
            const resultTypedData = await lensClient.sdk.publication.createMomokaCommentTypedData({
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

            const broadcastResult = await lensClient.sdk.transaction.broadcastOnMomoka({
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
        const result = await lensClient.sdk.publication.commentOnchain({
            commentOn: postId,
            contentURI: comment,
        });

        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue) || !resultValue.txHash) {
            const walletClient = await getWalletClientRequired(config);

            const resultTypedData = await lensClient.sdk.publication.createOnchainCommentTypedData({
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

            const broadcastResult = await lensClient.sdk.transaction.broadcastOnchain({
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
        const result = await lensClient.sdk.publication.reactions.add({
            for: postId,
            reaction: PublicationReactionType.Upvote,
        });

        if (result.isFailure()) throw new Error(`Something went wrong: ${JSON.stringify(result.isFailure())}`);
    }

    async unvotePost(postId: string): Promise<void> {
        const result = await lensClient.sdk.publication.reactions.remove({
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
        const profiles = await lensClient.sdk.wallet.profilesManaged({ for: address });
        const result = profiles.items.map(formatLensProfile);
        const index = result.findIndex((profile) => profile.handle === lastLoggedInProfile?.handle?.fullHandle);
        if (index > -1) {
            const [value] = result.splice(index, 1);
            result.unshift(value);
        }
        return result;
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const result = await lensClient.sdk.profile.fetch({
            forProfileId: profileId,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getProfileByHandle(handle: string): Promise<Profile> {
        const result = await lensClient.sdk.profile.fetch({
            forHandle: `lens/${handle}`,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getPostById(postId: string): Promise<Post> {
        const result = await lensClient.sdk.publication.fetch({
            forId: postId,
        });
        if (!result) throw new Error(t`No post found`);

        const post = formatLensPost(result);
        return post;
    }

    async getPostByTxHash(txHash: string): Promise<Post> {
        const result = await lensClient.sdk.publication.fetch({
            forTxHash: txHash,
        });
        if (!result) throw new Error(t`No post found`);

        const post = formatLensPost(result);
        return post;
    }

    async getPostByTxHashWithPolling(txHash: string): Promise<Post> {
        return pollingWithRetry(this.getPostByTxHash.bind(this, txHash), 60, 2000);
    }

    async getCommentsById(
        postId: string,
        indicator?: PageIndicator,
        hasFilter = true,
    ): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensClient.sdk.publication.fetchAll({
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
            indicator ?? createIndicator(),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getCommentsByUserId(postId: string, profileId: string, indicator?: PageIndicator) {
        const result = await lensClient.sdk.publication.fetchAll({
            where: {
                commentOn: { id: postId },
                from: [profileId],
            },
        });

        if (!result) throw new Error(t`No comments found`);

        return createPageable(
            result.items.map(formatLensPost),
            indicator ?? createIndicator(),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensClient.sdk.explore.publications({
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
        const data = await lensClient.sdk.feed.fetch({
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
            indicator ?? createIndicator(),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getCollectedPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensClient.sdk.publication.fetchAll({
            where: {
                actedBy: profileId,
                publicationTypes: [PublicationType.Post, PublicationType.Comment, PublicationType.Mirror],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            uniqWith(result.items.map(formatLensPost), (a, b) => a.postId === b.postId),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensClient.sdk.publication.fetchAll({
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
        const result = await lensClient.sdk.publication.fetchAll({
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
        const result = await lensClient.sdk.publication.fetchAll({
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
        const result = await lensClient.sdk.publication.fetchAll({
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
        const result = await lensClient.sdk.publication.fetchAll({
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
        const result = await lensClient.sdk.publication.fetchAll({
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
        const result = await lensClient.sdk.publication.fetchAll({
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

    async follow(profileId: string): Promise<void> {
        const result = await lensClient.sdk.profile.follow({
            follow: [
                {
                    profileId,
                },
            ],
        });
        const resultValue = result.unwrap();
        if (!isRelaySuccess(resultValue)) {
            const result = await lensClient.sdk.profile.createFollowTypedData({
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

            const broadcastResult = await lensClient.sdk.transaction.broadcastOnchain({
                id: data.id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();
            if (!isRelaySuccess(broadcastValue) || !broadcastValue.txHash) {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }

            await waitUntilComplete(lensClient.sdk, broadcastValue.txHash);
        } else {
            await waitUntilComplete(lensClient.sdk, resultValue.txHash);
        }
    }

    async unfollow(profileId: string): Promise<void> {
        const result = await lensClient.sdk.profile.unfollow({
            unfollow: [profileId],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            const followTypedDataResult = await lensClient.sdk.profile.createUnfollowTypedData({
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

            const broadcastResult = await lensClient.sdk.transaction.broadcastOnchain({
                id: data.id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();
            if (!isRelaySuccess(broadcastValue) || !broadcastValue.txHash) {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }

            await waitUntilComplete(lensClient.sdk, broadcastValue.txHash);
        } else {
            await waitUntilComplete(lensClient.sdk, resultValue.txHash);
        }
    }

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await lensClient.sdk.profile.followers({
            of: profileId,
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await lensClient.sdk.profile.following({
            for: profileId,
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async isFollowedByMe(profileId: string): Promise<boolean> {
        const result = await lensClient.sdk.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowedByMe.value ?? false;
    }

    async isFollowingMe(profileId: string): Promise<boolean> {
        const result = await lensClient.sdk.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowingMe.value ?? false;
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const response = await lensClient.sdk.notifications.fetch({
            where: {
                customFilters: [CustomFiltersType.Gardeners],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const result = response.unwrap();

        const data = result.items.map((item) => {
            if (item.__typename === 'MirrorNotification') {
                if (item.mirrors.length === 0) throw new Error('No mirror found');

                const time = first(item.mirrors)?.mirroredAt;
                return {
                    source: SocialPlatform.Lens,
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
                    source: SocialPlatform.Lens,
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
                    source: SocialPlatform.Lens,
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
                    source: SocialPlatform.Lens,
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
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Follow,
                    followers: item.followers.map(formatLensProfile),
                };
            }

            if (item.__typename === 'MentionNotification') {
                const post = formatLensPost(item.publication);

                return {
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Mention,
                    post,
                    timestamp: new Date(item.publication.createdAt).getTime(),
                };
            }

            if (item.__typename === 'ActedNotification') {
                const time = first(item.actions)?.actedAt;
                return {
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Act,
                    post: formatLensPost(item.publication),
                    actions: item.actions.map((x) => formatLensProfile(x.by)),
                    timestamp: time ? new Date(time).getTime() : undefined,
                };
            }

            return;
        });

        return createPageable(
            data.filter((item) => typeof item !== 'undefined') as Notification[],
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await lensClient.sdk.explore.profiles({
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
        const result = await lensClient.sdk.search.profiles({
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
        const result = await lensClient.sdk.search.publications({
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
        const posts = await lensClient.sdk.publication.fetchAll({
            limit: LimitType.TwentyFive,
            where: {
                publicationIds: [postId, ...response.data],
            },
        });

        return posts.items.map(formatLensPost);
    }
}

export const LensSocialMediaProvider = new LensSocialMedia();
