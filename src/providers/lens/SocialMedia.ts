import {
    CommentRankingFilterType,
    CustomFiltersType,
    ExploreProfilesOrderByType,
    ExplorePublicationsOrderByType,
    FeedEventItemType,
    isRelaySuccess,
    LimitType,
    PublicationReactionType,
    PublicationType,
} from '@lens-protocol/client';
import { t } from '@lingui/macro';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { isZero } from '@masknet/web3-shared-base';
import { first, flatMap } from 'lodash-es';
import type { TypedDataDomain } from 'viem';
import { polygon } from 'viem/chains';

import { lensClient } from '@/configs/lensClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { formatLensPost, formatLensPostByFeed, formatLensQuoteOrComment } from '@/helpers/formatLensPost.js';
import { formatLensProfile } from '@/helpers/formatLensProfile.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { LensSession } from '@/providers/lens/Session.js';
import {
    type Notification,
    NotificationType,
    type Post,
    type Profile,
    type Provider,
    type Reaction,
    ReactionType,
    Type,
} from '@/providers/types/SocialMedia.js';

export class LensSocialMedia implements Provider {
    get type() {
        return Type.Lens;
    }

    async createSession(): Promise<LensSession> {
        throw new Error('Please use createSessionForProfileId() instead.');
    }

    async createSessionForProfileId(profileId: string): Promise<LensSession> {
        const walletClient = await getWalletClientRequired({
            chainId: polygon.id,
        });

        const { id, text } = await lensClient.authentication.generateChallenge({
            for: profileId,
            signedBy: walletClient.account.address,
        });
        const signature = await walletClient.signMessage({
            message: text,
        });

        await lensClient.authentication.authenticate({
            id,
            signature,
        });

        const now = Date.now();

        return new LensSession(
            profileId,
            '', // the LensClient will renew it with refreshToken
            now,
            now + 1000 * 60 * 60 * 24 * 30, // 30 days
        );
    }

    async updateSignless(enable: boolean): Promise<void> {
        const typedDataResult = await lensClient.profile.createChangeProfileManagersTypedData({
            approveSignless: enable,
        });

        const { id, typedData } = typedDataResult.unwrap();
        const walletClient = await getWalletClientRequired();
        const signedTypedData = await walletClient.signTypedData({
            domain: typedData.domain as TypedDataDomain,
            types: typedData.types,
            primaryType: 'ChangeDelegatedExecutorsConfig',
            message: typedData.value,
        });

        const broadcastOnchainResult = await lensClient.transaction.broadcastOnchain({
            id,
            signature: signedTypedData,
        });

        const onchainRelayResult = broadcastOnchainResult.unwrap();

        if (onchainRelayResult.__typename === 'RelayError') {
            console.log("DEBUG: Couldn't update signless", onchainRelayResult);
        }
        return;
    }

    async publishPost(post: Post): Promise<Post> {
        if (!post.metadata.contentURI) throw new Error(t`No content URI found`);

        if (post.author.signless) {
            const result = await lensClient.publication.postOnchain({
                contentURI: post.metadata.contentURI,
            });
            const resultValue = result.unwrap();
            if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);

            return post;
        } else {
            const walletClient = await getWalletClientRequired();
            const resultTypedData = await lensClient.publication.createOnchainPostTypedData({
                contentURI: post.metadata.contentURI,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Post',
                message: typedData.value,
            });

            const broadcastResult = await lensClient.transaction.broadcastOnchain({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (!isRelaySuccess(broadcastValue)) {
                throw new Error(`Something went wrong ${JSON.stringify(broadcastValue)}`);
            }

            return post;
        }
    }

    async mirrorPost(postId: string): Promise<Post> {
        const result = await lensClient.publication.mirrorOnchain({
            mirrorOn: postId,
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);

        const post = await this.getPostById(postId);
        return post;
    }

    // intro is the contentURI of the post
    async quotePost(postId: string, intro: string, signless?: boolean): Promise<Post> {
        if (signless) {
            const result = await lensClient.publication.quoteOnchain({
                quoteOn: postId,
                contentURI: intro,
            });
            const resultValue = result.unwrap();

            if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);
        } else {
            const walletClient = await getWalletClientRequired();
            const resultTypedData = await lensClient.publication.createOnchainQuoteTypedData({
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

            const broadcastResult = await lensClient.transaction.broadcastOnchain({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (!isRelaySuccess(broadcastValue)) {
                throw new Error(`Something went wrong ${JSON.stringify(broadcastValue)}`);
            }
        }
        const post = await this.getPostById(postId);
        return post;
    }

    async collectPost(postId: string): Promise<void> {
        const result = await lensClient.publication.bookmarks.add({
            on: postId,
        });

        if (result.isFailure()) throw new Error(`Something went wrong ${JSON.stringify(result.isFailure())}`);
    }

    // comment is the contentURI of the post
    async commentPost(postId: string, comment: string, signless?: boolean): Promise<void> {
        if (signless) {
            const result = await lensClient.publication.commentOnchain({
                commentOn: postId,
                contentURI: comment,
            });
            const resultValue = result.unwrap();

            if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);
        } else {
            const walletClient = await getWalletClientRequired();
            const resultTypedData = await lensClient.publication.createOnchainCommentTypedData({
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

            const broadcastResult = await lensClient.transaction.broadcastOnchain({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (!isRelaySuccess(broadcastValue)) {
                throw new Error(`Something went wrong ${JSON.stringify(broadcastValue)}`);
            }
        }
    }

    async upvotePost(postId: string): Promise<Reaction> {
        const result = await lensClient.publication.reactions.add({
            for: postId,
            reaction: PublicationReactionType.Upvote,
        });

        if (result.isFailure()) throw new Error(`Something went wrong ${JSON.stringify(result.isFailure())}`);

        return {
            reactionId: '',
            type: ReactionType.Upvote,
            timestamp: Date.now(),
        };
    }

    async unvotePost(postId: string): Promise<void> {
        const result = await lensClient.publication.reactions.remove({
            for: postId,
            reaction: PublicationReactionType.Upvote,
        });

        if (result.isFailure()) throw new Error(`Something went wrong ${JSON.stringify(result.isFailure())}`);
    }

    async getProfilesByAddress(address: string): Promise<Profile[]> {
        const profiles = await lensClient.wallet.profilesManaged({ for: address });
        return profiles.items.map(formatLensProfile);
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const result = await lensClient.profile.fetch({
            forProfileId: profileId,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getProfileByHandle(profileId: string): Promise<Profile> {
        const result = await lensClient.profile.fetch({
            forHandle: profileId,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getPostById(postId: string): Promise<Post> {
        const result = await lensClient.publication.fetch({
            forId: postId,
        });

        if (!result) throw new Error(t`No post found`);

        const post = formatLensPost(result);
        return post;
    }

    async getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensClient.publication.fetchAll({
            where: {
                commentOn: { id: postId, ranking: { filter: CommentRankingFilterType.Relevant } },
                customFilters: [CustomFiltersType.Gardeners],
            },
            limit: LimitType.TwentyFive,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        if (!result) throw new Error(t`No comments found`);

        return createPageable(
            result.items.map((item) => formatLensPost(item)),
            indicator ?? createIndicator(),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensClient.explore.publications({
            orderBy: ExplorePublicationsOrderByType.LensCurated,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
            limit: LimitType.TwentyFive,
        });

        return createPageable(
            result.items.map((item) => formatLensPost(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async discoverPostsById(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const data = await lensClient.feed.fetch({
            where: {
                for: profileId,
                feedEventItemTypes: [FeedEventItemType.Post, FeedEventItemType.Comment, FeedEventItemType.Mirror],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        if (data.isFailure()) throw new Error(`Some thing went wrong ${JSON.stringify(data.isFailure())}`);

        const result = data.unwrap();
        return createPageable(
            result.items.map((item) => formatLensPostByFeed(item)),
            indicator ?? createIndicator(),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsByCollected(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensClient.publication.fetchAll({
            where: {
                actedBy: profileId,
                publicationTypes: [PublicationType.Post, PublicationType.Comment, PublicationType.Mirror],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            result.items.map((item) => formatLensPost(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensClient.publication.fetchAll({
            where: {
                from: [profileId],
                publicationTypes: [PublicationType.Post, PublicationType.Mirror, PublicationType.Quote],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            result.items.map((item) => formatLensPost(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    // TODO: Invalid
    async getPostsBeMentioned(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await lensClient.publication.fetchAll({
            where: {
                from: [profileId],
            },
        });

        return createPageable(
            result.items.map((item) => formatLensPost(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsLiked(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await lensClient.publication.fetchAll({
            where: {
                actedBy: profileId,
            },
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map((item) => formatLensPost(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsReplies(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await lensClient.publication.fetchAll({
            where: {
                from: [profileId],
                publicationTypes: [PublicationType.Comment],
            },
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map((item) => formatLensPost(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await lensClient.publication.fetchAll({
            where: {
                commentOn: {
                    id: postId,
                },
            },
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map((item) => formatLensPost(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    getReactors!: (postId: string) => Promise<Pageable<Profile>>;

    async follow(profileId: string): Promise<void> {
        const result = await lensClient.profile.follow({
            follow: [
                {
                    profileId,
                },
            ],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            const result = await lensClient.profile.createFollowTypedData({
                follow: [
                    {
                        profileId,
                    },
                ],
            });

            const data = result.unwrap();
            const walletClient = await getWalletClientRequired();
            const signedTypedData = await walletClient.signTypedData({
                domain: data.typedData.domain as TypedDataDomain,
                types: data.typedData.types,
                primaryType: 'Follow',
                message: data.typedData.value,
            });

            const broadcastResult = await lensClient.transaction.broadcastOnchain({
                id: data.id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();
            if (!isRelaySuccess(broadcastValue)) {
                throw new Error(`Something went wrong ${JSON.stringify(broadcastValue)}`);
            }
        }
    }

    async unfollow(profileId: string): Promise<void> {
        const result = await lensClient.profile.unfollow({
            unfollow: [profileId],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            const followTypedDataResult = await lensClient.profile.createUnfollowTypedData({
                unfollow: [profileId],
            });

            const data = followTypedDataResult.unwrap();
            const client = await getWalletClientRequired();
            const signedTypedData = await client.signTypedData({
                domain: data.typedData.domain as TypedDataDomain,
                types: data.typedData.types,
                primaryType: 'Unfollow',
                message: data.typedData.value,
            });

            const broadcastResult = await lensClient.transaction.broadcastOnchain({
                id: data.id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();
            if (!isRelaySuccess(broadcastValue)) {
                throw new Error(`Something went wrong ${JSON.stringify(broadcastValue)}`);
            }
        }
    }

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await lensClient.profile.followers({
            of: profileId,
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map((item) => formatLensProfile(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await lensClient.profile.following({
            for: profileId,
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map((item) => formatLensProfile(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async isFollowedByMe(profileId: string): Promise<boolean> {
        const result = await lensClient.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowedByMe.value ?? false;
    }

    async isFollowingMe(profileId: string): Promise<boolean> {
        const result = await lensClient.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowingMe.value ?? false;
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const response = await lensClient.notifications.fetch({
            where: {
                customFilters: [CustomFiltersType.Gardeners],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const result = response.unwrap();

        const data = await Promise.all(
            result.items.map(async (item) => {
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
            }),
        );

        return createPageable(
            data.filter((item) => typeof item !== 'undefined') as Notification[],
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await lensClient.explore.profiles({
            orderBy: ExploreProfilesOrderByType.MostFollowers,
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map((item) => formatLensProfile(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const result = await lensClient.search.profiles({
            query: q,
            cursor: indicator?.id,
            limit: LimitType.TwentyFive,
        });
        return createPageable(
            result.items.map((item) => formatLensProfile(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await lensClient.search.publications({
            query: q,
            cursor: indicator?.id,
            limit: LimitType.TwentyFive,
        });
        return createPageable(
            result.items.map((item) => formatLensPost(item)),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }
}

export const LensSocialMediaProvider = new LensSocialMedia();
