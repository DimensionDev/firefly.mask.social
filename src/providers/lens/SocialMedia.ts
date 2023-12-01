import {
    CustomFiltersType,
    ExploreProfilesOrderByType,
    ExplorePublicationsOrderByType,
    FeedEventItemType,
    isRelaySuccess,
    type IStorageProvider,
    LensClient,
    LimitType,
    production,
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
import { first, flatMap } from 'lodash-es';
import type { TypedDataDomain } from 'viem';
import type { WalletClient } from 'wagmi';
import { getWalletClient } from 'wagmi/actions';

import { SocialPlatform } from '@/constants/enum.js';
import { formatLensPost, formatLensPostByFeed, formatLensQuoteOrComment } from '@/helpers/formatLensPost.js';
import { formatLensProfile } from '@/helpers/formatLensProfile.js';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer.js';
import { isZero } from '@/maskbook/packages/web3-shared/base/src/index.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
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

class LocalStorageProvider implements IStorageProvider {
    getItem(key: string) {
        return window.localStorage.getItem(key);
    }

    setItem(key: string, value: string) {
        window.localStorage.setItem(key, value);
    }

    removeItem(key: string) {
        window.localStorage.removeItem(key);
    }
}

export class LensSocialMedia implements Provider {
    private lensClient = new LensClient({
        environment: production,
        storage: new LocalStorageProvider(),
    });

    get type() {
        return Type.Lens;
    }

    async getWallet(): Promise<WalletClient> {
        const client = await getWalletClient();
        if (!client) throw new Error(t`No wallet client found`);

        return client;
    }

    async createSession(): Promise<LensSession> {
        const wallet = await this.getWallet();
        const address = wallet.account.address;
        const profile = await this.lensClient.profile.fetchDefault({
            for: address,
        });
        if (!profile) throw new Error(t`No profile found`);

        const { id, text } = await this.lensClient.authentication.generateChallenge({
            for: profile.id,
            signedBy: address,
        });
        const signature = await wallet.signMessage({
            message: text,
        });
        await this.lensClient.authentication.authenticate({
            id,
            signature,
        });

        const accessTokenResult = await this.lensClient.authentication.getAccessToken();
        const accessToken = accessTokenResult.unwrap();
        const { payload } = await generateCustodyBearer(wallet);

        const currentSession = new LensSession(
            profile.id,
            accessToken,
            payload.params.timestamp,
            payload.params.expiresAt,
            formatLensProfile(profile),
            this.lensClient,
        );
        localStorage.setItem(`lens_session${profile.id}`, currentSession.serialize());
        return currentSession;
    }

    async createSessionForProfileId(profileId: string): Promise<LensSession> {
        const wallet = await this.getWallet();
        const address = wallet.account.address;
        const profile = await this.getProfileById(profileId);

        const { id, text } = await this.lensClient.authentication.generateChallenge({
            for: profileId,
            signedBy: address,
        });
        const signature = await wallet.signMessage({
            message: text,
        });

        await this.lensClient.authentication.authenticate({
            id,
            signature,
        });

        const accessTokenResult = await this.lensClient.authentication.getAccessToken();
        const accessToken = accessTokenResult.unwrap();
        const { payload } = await generateCustodyBearer(wallet);

        const currentSession = new LensSession(
            profileId,
            accessToken,
            payload.params.timestamp,
            payload.params.expiresAt,
            profile,
            this.lensClient,
        );
        localStorage.setItem(`lens_session${profileId}`, currentSession.serialize());
        return currentSession;
    }

    async getProfilesByAddress(address: string): Promise<Profile[]> {
        const profiles = await this.lensClient.profile.fetchAll({
            where: {
                ownedBy: [address],
            },
        });
        return profiles.items.map(formatLensProfile);
    }

    async resumeSession(profileId: string): Promise<LensSession | null> {
        const currentTime = Date.now();

        const storedSession = localStorage.getItem(`lens_session${profileId}`);

        if (storedSession) {
            const recoveredSession = SessionFactory.createSession<LensSession>(storedSession);
            if (recoveredSession.expiresAt > currentTime) {
                this.lensClient = recoveredSession.client;
                return recoveredSession;
            } else {
                return null;
            }
        }
        return null;
    }

    async updateSignless(enable: boolean): Promise<void> {
        const typedDataResult = await this.lensClient.profile.createChangeProfileManagersTypedData({
            approveSignless: enable,
        });

        const { id, typedData } = typedDataResult.unwrap();
        const wallet = await this.getWallet();
        const signedTypedData = await wallet.signTypedData({
            domain: typedData.domain as TypedDataDomain,
            types: typedData.types,
            primaryType: 'ChangeDelegatedExecutorsConfig',
            message: typedData.value,
        });

        const broadcastOnchainResult = await this.lensClient.transaction.broadcastOnchain({
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

        const profile = await this.getProfileById(post.author.profileId);

        if (profile.signless) {
            const result = await this.lensClient.publication.postOnchain({
                contentURI: post.metadata.contentURI,
            });
            const resultValue = result.unwrap();
            if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);

            return post;
        } else {
            const wallet = await this.getWallet();

            const resultTypedData = await this.lensClient.publication.createOnchainPostTypedData({
                contentURI: post.metadata.contentURI,
            });

            const { id, typedData } = resultTypedData.unwrap();

            console.log(typedData);

            const signedTypedData = await wallet.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Post',
                message: typedData.value,
            });

            const broadcastResult = await this.lensClient.transaction.broadcastOnchain({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            console.log(broadcastValue);

            if (!isRelaySuccess(broadcastValue)) {
                throw new Error(`Something went wrong ${JSON.stringify(broadcastValue)}`);
            }

            return post;
        }
    }

    async mirrorPost(postId: string): Promise<Post> {
        const result = await this.lensClient.publication.mirrorOnchain({
            mirrorOn: postId,
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);

        const post = await this.getPostById(postId);
        return post;
    }

    // intro is the contentURI of the post
    async quotePost(postId: string, intro: string): Promise<Post> {
        const result = await this.lensClient.publication.quoteOnchain({
            quoteOn: postId,
            contentURI: intro,
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);

        const post = await this.getPostById(postId);
        return post;
    }

    async collectPost(postId: string): Promise<void> {
        const result = await this.lensClient.publication.bookmarks.add({
            on: postId,
        });

        if (result.isFailure()) throw new Error(`Something went wrong ${JSON.stringify(result.isFailure())}`);
    }

    // comment is the contentURI of the post
    async commentPost(postId: string, comment: string): Promise<void> {
        const result = await this.lensClient.publication.commentOnchain({
            commentOn: postId,
            contentURI: comment,
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);
    }

    async upvotePost(postId: string): Promise<Reaction> {
        const result = await this.lensClient.publication.reactions.add({
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
        const result = await this.lensClient.publication.reactions.remove({
            for: postId,
            reaction: PublicationReactionType.Upvote,
        });

        if (result.isFailure()) throw new Error(`Something went wrong ${JSON.stringify(result.isFailure())}`);
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const result = await this.lensClient.profile.fetch({
            forProfileId: profileId,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getProfileByHandle(profileId: string): Promise<Profile> {
        const result = await this.lensClient.profile.fetch({
            forHandle: profileId,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getPostById(postId: string): Promise<Post> {
        const result = await this.lensClient.publication.fetch({
            forId: postId,
        });

        if (!result) throw new Error(t`No post found`);

        const post = formatLensPost(result);
        return post;
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await this.lensClient.explore.publications({
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
        const data = await this.lensClient.feed.fetch({
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
        const result = await this.lensClient.publication.fetchAll({
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
        const result = await this.lensClient.publication.fetchAll({
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
        const result = await this.lensClient.publication.fetchAll({
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
        const result = await this.lensClient.publication.fetchAll({
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
        const result = await this.lensClient.publication.fetchAll({
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
        const result = await this.lensClient.publication.fetchAll({
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
        const result = await this.lensClient.profile.follow({
            follow: [
                {
                    profileId,
                },
            ],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            const result = await this.lensClient.profile.createFollowTypedData({
                follow: [
                    {
                        profileId,
                    },
                ],
            });

            const data = result.unwrap();
            const wallet = await this.getWallet();
            const signedTypedData = await wallet.signTypedData({
                domain: data.typedData.domain as TypedDataDomain,
                types: data.typedData.types,
                primaryType: 'Follow',
                message: data.typedData.value,
            });

            const broadcastResult = await this.lensClient.transaction.broadcastOnchain({
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
        const result = await this.lensClient.profile.unfollow({
            unfollow: [profileId],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            const followTypedDataResult = await this.lensClient.profile.createUnfollowTypedData({
                unfollow: [profileId],
            });

            const data = followTypedDataResult.unwrap();
            const wallet = await this.getWallet();
            const signedTypedData = await wallet.signTypedData({
                domain: data.typedData.domain as TypedDataDomain,
                types: data.typedData.types,
                primaryType: 'Unfollow',
                message: data.typedData.value,
            });

            const broadcastResult = await this.lensClient.transaction.broadcastOnchain({
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
        const result = await this.lensClient.profile.followers({
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
        const result = await this.lensClient.profile.following({
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
        const result = await this.lensClient.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowedByMe.value ?? false;
    }

    async isFollowingMe(profileId: string): Promise<boolean> {
        const result = await this.lensClient.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowingMe.value ?? false;
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const response = await this.lensClient.notifications.fetch({
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
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next ?? undefined) : undefined,
        );
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await this.lensClient.explore.profiles({
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
        const result = await this.lensClient.search.profiles({
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
        const result = await this.lensClient.search.publications({
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
