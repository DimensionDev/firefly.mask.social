import { getWalletClient } from 'wagmi/actions';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';
import {
    NetworkType,
    Notification,
    Post,
    Profile,
    ProfileStatus,
    Provider,
    Reaction,
    ReactionType,
    Type,
} from '@/providers/types/SocialMedia';
import {
    AnyPublicationFragment,
    ExploreProfilesOrderByType,
    ExplorePublicationsOrderByType,
    LensClient,
    ProfileFragment,
    PublicationReactionType,
    PublicationType,
    development,
    isRelaySuccess,
    production,
} from '@lens-protocol/client';
import { LensSession } from '@/providers/lens/Session';
import { PageIndicator, Pageable } from '@/helpers/createPageable';

export class LensSocialMedia implements Provider {
    private currentSession?: LensSession;

    lensClient: LensClient;

    constructor() {
        this.lensClient = new LensClient({
            environment: process.env.NODE_ENV === 'production' ? production : development,
        });
    }

    get type() {
        return Type.Lens;
    }

    async createSession(): Promise<LensSession> {
        const client = await getWalletClient();
        if (!client) throw new Error('No client found');

        const address = client.account.address;
        const profile = await this.lensClient.profile.fetchDefault({
            for: address,
        });
        if (!profile) throw new Error('No profile found');

        const { id, text } = await this.lensClient.authentication.generateChallenge({
            for: profile.id,
            signedBy: address,
        });
        const signature = await client.signMessage({
            message: text,
        });
        await this.lensClient.authentication.authenticate({
            id,
            signature,
        });

        const accessTokenResult = await this.lensClient.authentication.getAccessToken();
        const accessToken = accessTokenResult.unwrap();
        const { payload } = await generateCustodyBearer(client);

        return (this.currentSession = new LensSession(
            profile.id,
            accessToken,
            payload.params.timestamp,
            payload.params.expiresAt,
            this.lensClient,
        ));
    }

    async resumeSession(): Promise<LensSession> {
        if (this.currentSession && this.currentSession.expiresAt > Date.now()) {
            return this.currentSession;
        }

        this.currentSession = await this.createSession();
        return this.currentSession;
    }

    async publishPost(post: Post): Promise<Post> {
        if (!post.metadata.contentURI) throw new Error('No content URI found');

        const result = await this.lensClient.publication.postOnchain({
            contentURI: post.metadata.contentURI,
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);

        return post;
    }

    async mirrorPost(postId: string): Promise<Post> {
        const result = await this.lensClient.publication.mirrorOnchain({
            mirrorOn: postId,
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            console.log(`Something went wrong`, resultValue);
        }

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
        if (!result) throw new Error('No profile found');

        return this.formatProfile(result);
    }

    formatProfile(result: ProfileFragment): Profile {
        return {
            profileId: result.id,
            nickname: result.metadata?.displayName ?? '',
            displayName: result.metadata?.displayName ?? '',
            pfp:
                result.metadata?.picture?.__typename === 'ImageSet'
                    ? result.metadata?.picture?.raw.uri
                    : result.metadata?.picture?.__typename === 'NftImage'
                    ? result.metadata?.picture?.image.raw.uri
                    : '',
            bio: result.metadata?.bio ?? undefined,
            address: result.followNftAddress?.address ?? undefined,
            followerCount: result.stats.followers,
            followingCount: result.stats.following,
            status: ProfileStatus.Active,
            verified: true,
            ownedBy: {
                networkType: NetworkType.Ethereum,
                address: result.ownedBy.address,
            },
        };
    }

    async getPostById(postId: string): Promise<Post> {
        const result = await this.lensClient.publication.fetch({
            forId: postId,
        });
        if (!result) throw new Error('No post found');

        const post = this.formatPost(result);
        return post;
    }

    formatPost(result: AnyPublicationFragment): Post {
        const profile = this.formatProfile(result.by);
        const timestamp = new Date(result.createdAt).getTime();

        if (result.__typename === 'Mirror') {
            return {
                postId: result.id,
                timestamp,
                author: profile,
                isHidden: result.isHidden,
                metadata: {
                    locale: '',
                    content: '',
                    contentURI: '',
                },
                __original__: result,
            };
        }

        if (result.metadata.__typename === 'EventMetadataV3') throw new Error('Event not supported');
        const mediaObjects =
            result.metadata.__typename !== 'StoryMetadataV3' && result.metadata.__typename !== 'TextOnlyMetadataV3'
                ? result.metadata.attachments?.map((attachment) =>
                      attachment.__typename === 'PublicationMetadataMediaAudio'
                          ? {
                                url: attachment.audio.raw.uri,
                                mimeType: attachment.audio.raw.mimeType ?? 'audio/*',
                            }
                          : attachment.__typename === 'PublicationMetadataMediaImage'
                          ? {
                                url: attachment.image.raw.uri,
                                mimeType: attachment.image.raw.mimeType ?? 'image/*',
                            }
                          : attachment.__typename === 'PublicationMetadataMediaVideo'
                          ? {
                                url: attachment.video.raw.uri,
                                mimeType: attachment.video.raw.mimeType ?? 'video/*',
                            }
                          : {
                                url: '',
                                mimeType: '',
                            },
                  ) ?? undefined
                : undefined;

        return {
            postId: result.id,
            timestamp,
            author: profile,
            mediaObjects,
            isHidden: result.isHidden,
            isEncrypted: !!result.metadata.encryptedWith,
            metadata: {
                locale: result.metadata.locale,
                content: result.metadata.content,
                contentURI: result.metadata.rawURI,
            },
            stats: {
                comments: result.stats.comments,
                mirrors: result.stats.mirrors,
                quotes: result.stats.quotes,
                reactions: result.stats.upvoteReactions,
                bookmarks: result.stats.bookmarks,
            },
            __original__: result,
        };
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.lensClient.explore.publications({
            orderBy: ExplorePublicationsOrderByType.LensCurated,
            cursor: indicator?.cursor,
        });

        return {
            indicator: indicator?.cursor,
            nextIndicator: result.pageInfo.next,
            data: result.items.map((item) => this.formatPost(item)),
        };
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.lensClient.publication.fetchAll({
            where: {
                from: [profileId],
                publicationTypes: [PublicationType.Post],
            },
            cursor: indicator?.cursor,
        });

        return {
            indicator: indicator?.cursor,
            nextIndicator: result.pageInfo.next,
            data: result.items.map((item) => this.formatPost(item)),
        };
    }

    // TODO: Invalid
    async getPostsBeMentioned(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.lensClient.publication.fetchAll({
            where: {
                from: [profileId],
            },
        });

        return {
            indicator: result.pageInfo.prev,
            nextIndicator: result.pageInfo.next,
            data: result.items.map((item) => this.formatPost(item)),
        };
    }

    async getPostsLiked(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.lensClient.publication.fetchAll({
            where: {
                actedBy: profileId,
            },
            cursor: indicator?.cursor,
        });

        return {
            indicator: result.pageInfo.prev,
            nextIndicator: result.pageInfo.next,
            data: result.items.map((item) => this.formatPost(item)),
        };
    }

    async getPostsReplies(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.lensClient.publication.fetchAll({
            where: {
                from: [profileId],
                publicationTypes: [PublicationType.Comment],
            },
            cursor: indicator?.cursor,
        });

        return {
            indicator: indicator?.cursor,
            nextIndicator: result.pageInfo.next,
            data: result.items.map((item) => this.formatPost(item)),
        };
    }

    async getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.lensClient.publication.fetchAll({
            where: {
                commentOn: {
                    id: postId,
                },
            },
            cursor: indicator?.cursor,
        });

        return {
            indicator: indicator?.cursor,
            nextIndicator: result.pageInfo.next,
            data: result.items.map((item) => this.formatPost(item)),
        };
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

        if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);
    }

    async unfollow(profileId: string): Promise<void> {
        const result = await this.lensClient.profile.unfollow({
            unfollow: [profileId],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) throw new Error(`Something went wrong ${JSON.stringify(resultValue)}`);
    }

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await this.lensClient.profile.followers({
            of: profileId,
            cursor: indicator?.cursor,
        });

        return {
            indicator: indicator?.cursor,
            nextIndicator: result.pageInfo.next,
            data: result.items.map((item) => {
                return this.formatProfile(item);
            }),
        };
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await this.lensClient.profile.following({
            for: profileId,
            cursor: indicator?.cursor,
        });

        return {
            indicator: indicator?.cursor,
            nextIndicator: result.pageInfo.next,
            data: result.items.map((item) => {
                return this.formatProfile(item);
            }),
        };
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

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification>> {
        const result = await this.lensClient.notifications.fetch({
            cursor: indicator?.cursor,
        });

        const value = result.unwrap();

        const data = await Promise.all(
            value.items.map(async (item) => {
                if (item.__typename === 'MirrorNotification') {
                    if (item.mirrors.length === 0) throw new Error('No mirror found');

                    return {
                        notificationId: item.id,
                        type: 'mirror',
                        mirror: await this.getPostById(item.mirrors[0].mirrorId),
                        post: await this.getPostById(item.publication.id),
                    };
                }

                if (item.__typename === 'QuoteNotification') {
                    const quote = await this.getPostById(item.quote.id);
                    return {
                        notificationId: item.id,
                        type: 'quote',
                        quote,
                        post: quote,
                    };
                }

                if (item.__typename === 'ReactionNotification') {
                    if (item.reactions.length === 0) throw new Error('No reaction found');

                    return {
                        notificationId: item.id,
                        type: 'reaction',
                        reaction: ReactionType.Upvote,
                        reactor: this.formatProfile(item.reactions[0].profile),
                        post: await this.getPostById(item.publication.id),
                    };
                }

                if (item.__typename === 'CommentNotification') {
                    const post = await this.getPostById(item.comment.commentOn.id);
                    return {
                        notificationId: item.id,
                        type: 'comment',
                        comment: {
                            commentId: item.comment.id,
                            timestamp: new Date(item.comment.createdAt).getTime(),
                            author: this.formatProfile(item.comment.by),
                            for: post,
                        },
                        post,
                    };
                }

                if (item.__typename === 'FollowNotification') {
                    if (item.followers.length === 0) throw new Error('No follower found');

                    return {
                        notificationId: item.id,
                        type: 'follow',
                        follower: this.formatProfile(item.followers[0]),
                    };
                }

                if (item.__typename === 'MentionNotification') {
                    const post = this.formatPost(item.publication);

                    return {
                        notificationId: item.id,
                        type: 'mention',
                        post,
                    };
                }
            }),
        );

        return {
            indicator: indicator?.cursor,
            nextIndicator: value.pageInfo.next,
            data: data.filter((item) => item !== undefined) as Notification[],
        };
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await this.lensClient.explore.profiles({
            orderBy: ExploreProfilesOrderByType.MostFollowers,
            cursor: indicator?.cursor,
        });

        return {
            indicator: indicator?.cursor,
            nextIndicator: result.pageInfo.next,
            data: result.items.map((item) => {
                return this.formatProfile(item);
            }),
        };
    }
}
