import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { isZero } from '@masknet/web3-shared-base';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { BookmarkType, FireflyPlatform, Source } from '@/constants/enum.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import {
    formatBriefChannelFromFirefly,
    formatChannelFromFirefly,
} from '@/helpers/formatFarcasterChannelFromFirefly.js';
import { formatFarcasterPostFromFirefly } from '@/helpers/formatFarcasterPostFromFirefly.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { formatFireflyProfilesFromWalletProfiles } from '@/helpers/formatFireflyProfilesFromWalletProfiles.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { NeynarSocialMediaProvider } from '@/providers/neynar/SocialMedia.js';
import {
    type BookmarkResponse,
    type CastResponse,
    type CastsOfChannelResponse,
    type CastsResponse,
    type ChannelResponse,
    type ChannelsResponse,
    type CommentsResponse,
    type DiscoverChannelsResponse,
    type FireFlyProfile,
    type FriendshipResponse,
    type NotificationResponse,
    NotificationType as FireflyNotificationType,
    type ReactorsResponse,
    type RelationResponse,
    type SearchCastsResponse,
    type SearchChannelsResponse,
    type SearchProfileResponse,
    type ThreadResponse,
    type UploadMediaTokenResponse,
    type UserResponse,
    type UsersResponse,
    type WalletProfileResponse,
} from '@/providers/types/Firefly.js';
import {
    type Channel,
    type Notification,
    NotificationType,
    type Post,
    type PostType,
    type Profile,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';

class FireflySocialMedia implements Provider {
    getChannelById(channelId: string): Promise<Channel> {
        return this.getChannelByHandle(channelId);
    }

    async getChannelByHandle(channelHandle: string): Promise<Channel> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel', {
            channelHandle,
        });
        const response = await fetchJSON<ChannelResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);

        return {
            ...formatBriefChannelFromFirefly(data.channel),
            blocked: data.blocked,
        };
    }

    async getChannelsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Channel, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/active_channels', {
            fid: profileId,
        });
        const response = await fetchJSON<ChannelsResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        const channels = data.map(formatChannelFromFirefly);
        return createPageable(channels, createIndicator(indicator));
    }

    async discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/discover/farcaster/trending_channels', {
            size: 20,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<DiscoverChannelsResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        const channels = data.channels.map(formatChannelFromFirefly);

        return createPageable(
            channels,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    getPostsByChannelId(channelId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return this.getPostsByChannelHandle(channelId, indicator);
    }

    getPostsByChannelHandle(channelHandle: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/casts', {
                channelHandle,
                fid: session?.profileId,
                size: 20,
                cursor: indicator?.id,
            });
            const response = await fetchJSON<CastsOfChannelResponse>(url, {
                method: 'GET',
            });
            const data = resolveFireflyResponseData(response);
            const posts = data.casts.map((x) => formatFarcasterPostFromFirefly(x));

            return createPageable(
                posts,
                createIndicator(indicator),
                data.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
            );
        });
    }

    async searchChannels(q: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/search/channels', {
            keyword: q,
            size: 20,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<SearchChannelsResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        const channels = data.channels.map(formatBriefChannelFromFirefly);

        return createPageable(
            channels,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    quotePost(postId: string, post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    collectPost(postId: string, collectionId?: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new Error('Method not implemented.');
    }

    getProfilesByIds(ids: string[]): Promise<Profile[]> {
        throw new Error('Method not implemented.');
    }

    getProfileByHandle(handle: string): Promise<Profile> {
        throw new Error('Method not implemented.');
    }

    getPostsBeMentioned(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsLiked(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsReplies(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    isFollowedByMe(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    isFollowingMe(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async publishPost(post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }
    async deletePost(postId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async upvotePost(postId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async unvotePost(postId: string) {
        throw new Error('Method not implemented.');
    }

    async commentPost(postId: string, post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async mirrorPost(postId: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async unmirrorPost(postId: string) {
        throw new Error('Method not implemented.');
    }

    async follow(profileId: string) {
        throw new Error('Method not implemented.');
    }

    async unfollow(profileId: string) {
        throw new Error('Method not implemented.');
    }

    get type() {
        return SessionType.Farcaster;
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/discover/farcaster/timeline', {
                size: 20,
                cursor: indicator?.id,
                sourceFid: session?.profileId,
            });
            const response = await fetchJSON<CastsResponse>(url);
            const data = resolveFireflyResponseData(response);
            const posts = data.casts.map((x) => formatFarcasterPostFromFirefly(x));

            return createPageable(
                posts,
                createIndicator(indicator),
                data.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
            );
        });
    }

    async getPostById(postId: string): Promise<Post> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast', {
                hash: postId,
                fid: session?.profileId,
                needRootParentHash: true,
            });
            const { data: cast } = await fetchJSON<CastResponse>(url, {
                method: 'GET',
            });

            if (!cast || cast.deleted_at) throw new Error('Post not found');
            return formatFarcasterPostFromFirefly(cast);
        });
    }

    async getProfileById(profileId: string): Promise<Profile> {
        return farcasterSessionHolder.withSession(async (session) => {
            const response = await fetchJSON<UserResponse>(
                urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/profile', {
                    fid: profileId,
                    sourceFid: session?.profileId,
                }),
                {
                    method: 'GET',
                },
            );
            const user = resolveFireflyResponseData(response);
            const friendship = await this.getFriendship(profileId);
            return formatFarcasterProfileFromFirefly({
                ...user,
                ...friendship,
            });
        });
    }

    async getAllPlatformProfileByIdentity(identity: string, source: Source): Promise<FireFlyProfile[]> {
        let queryKey = '';
        switch (source) {
            case Source.Lens:
                queryKey = 'lensHandle';
                break;
            case Source.Farcaster:
                queryKey = 'fid';
                break;
            case Source.Wallet:
                queryKey = 'walletAddress';
                break;
            case Source.Twitter:
                queryKey = 'twitterId';
                break;
            case Source.Article:
            default:
                break;
        }

        const url = urlcat(FIREFLY_ROOT_URL, '/v2/wallet/profile', queryKey ? { [`${queryKey}`]: identity } : {});

        const response = await fireflySessionHolder.fetch<WalletProfileResponse>(url, {
            method: 'GET',
        });

        const profiles = resolveFireflyResponseData(response);

        return formatFireflyProfilesFromWalletProfiles(profiles);
    }

    async getAllPlatformProfiles(lensHandle?: string, fid?: string, twitterId?: string): Promise<FireFlyProfile[]> {
        if (!lensHandle && !fid && !twitterId) return EMPTY_LIST;

        const url = urlcat(FIREFLY_ROOT_URL, '/v2/wallet/profile', {
            twitterId,
            lensHandle,
            fid,
        });

        const response = await fireflySessionHolder.fetch<WalletProfileResponse>(url, {
            method: 'GET',
        });

        const profiles = resolveFireflyResponseData(response);
        return formatFireflyProfilesFromWalletProfiles(profiles);
    }

    async getNextIDRelations(platform: string, identity: string) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/wallet/relations', {
            platform,
            identity,
        });

        const response = await fireflySessionHolder.fetch<RelationResponse>(url, {
            method: 'GET',
        });

        const relations = resolveFireflyResponseData(response);

        return relations;
    }

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followers', {
            fid: profileId,
            size: 10,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
        });
        const { list, next_cursor } = resolveFireflyResponseData(response);
        const data = list.map(formatFarcasterProfileFromFirefly);

        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next_cursor));
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followings', {
            fid: profileId,
            size: 10,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
        });
        const { list, next_cursor } = resolveFireflyResponseData(response);
        const data = list.map(formatFarcasterProfileFromFirefly);

        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next_cursor));
    }

    async getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        // TODO: pass fid
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/comments', {
            hash: postId,
            size: 25,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });
        const response = await fetchJSON<CommentsResponse>(url, {
            method: 'GET',
        });
        const { comments, cursor } = resolveFireflyResponseData(response);

        return createPageable(
            comments.map((item) => formatFarcasterPostFromFirefly(item)),
            indicator ?? createIndicator(indicator),
            cursor ? createNextIndicator(indicator, cursor) : undefined,
        );
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster/casts');
            const response = await fetchJSON<CastsResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    fids: [profileId],
                    size: 25,
                    sourceFid: session?.profileId,
                    cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                }),
            });
            const { casts, cursor } = resolveFireflyResponseData(response);
            const data = casts.map((cast) => formatFarcasterPostFromFirefly(cast));

            return createPageable(
                data,
                createIndicator(indicator),
                cursor ? createNextIndicator(indicator, cursor) : undefined,
            );
        });
    }

    async getLikedPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster/likes');
            const response = await fetchJSON<CastsResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    fids: [profileId],
                    size: 25,
                    sourceFid: session?.profileId,
                    cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                }),
            });
            const { casts, cursor } = resolveFireflyResponseData(response);
            const data = casts.map((cast) => formatFarcasterPostFromFirefly(cast));

            return createPageable(
                data,
                createIndicator(indicator),
                cursor ? createNextIndicator(indicator, cursor) : undefined,
            );
        });
    }

    async getRepliesPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster');

            const response = await fetchJSON<CastsResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    fids: [profileId],
                    size: 25,
                    sourceFid: session?.profileId,
                    cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                    needRootParentHash: true,
                }),
            });

            const { casts, cursor } = resolveFireflyResponseData(response);
            const data = casts.map((cast) => formatFarcasterPostFromFirefly(cast));

            return createPageable(
                data,
                createIndicator(indicator),
                cursor ? createNextIndicator(indicator, cursor) : undefined,
            );
        });
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const profileId = farcasterSessionHolder.sessionRequired.profileId;
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/notifications/new', {
            fid: profileId,
            sourceFid: profileId,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });
        const response = await fetchJSON<NotificationResponse>(url, { method: 'GET' });
        const data = resolveFireflyResponseData(response);
        const result = data.notifications.map<Notification | undefined>((notification) => {
            const notificationId = `${profileId}_${notification.timestamp}_${notification.notificationType}`;
            const users =
                notification.users?.map(formatFarcasterProfileFromFirefly) ??
                (notification.user ? [formatFarcasterProfileFromFirefly(notification.user)] : EMPTY_LIST);
            const post = notification.cast ? formatFarcasterPostFromFirefly(notification.cast) : undefined;
            const timestamp = notification.timestamp ? new Date(notification.timestamp).getTime() : undefined;
            if (notification.notificationType === FireflyNotificationType.CastBeLiked) {
                return {
                    source: Source.Farcaster,
                    notificationId,
                    type: NotificationType.Reaction,
                    reactors: users,
                    post,
                    timestamp,
                };
            } else if (notification.notificationType === FireflyNotificationType.CastBeRecasted) {
                return {
                    source: Source.Farcaster,
                    notificationId,
                    type: NotificationType.Mirror,
                    mirrors: users,
                    post,
                    timestamp,
                };
            } else if (notification.notificationType === FireflyNotificationType.CastBeReplied) {
                const commentOn = notification.cast?.parentCast
                    ? formatFarcasterPostFromFirefly(notification.cast.parentCast)
                    : undefined;
                return {
                    source: Source.Farcaster,
                    notificationId,
                    type: NotificationType.Comment,
                    comment: post
                        ? {
                              ...post,
                              commentOn,
                          }
                        : undefined,
                    post: commentOn,
                    timestamp,
                };
            } else if (notification.notificationType === FireflyNotificationType.BeFollowed) {
                return {
                    source: Source.Farcaster,
                    notificationId,
                    type: NotificationType.Follow,
                    followers: users,
                };
            } else if (notification.notificationType === FireflyNotificationType.BeMentioned) {
                return {
                    source: Source.Farcaster,
                    notificationId,
                    type: NotificationType.Mention,
                    post,
                    timestamp,
                };
            }
            return;
        });
        return createPageable(
            compact(result),
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
        );
    }

    async discoverPostsById(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            // TODO: replace to prod url
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/timeline/farcaster_for_fid');
            const response = await fetchJSON<CastsResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    fid: profileId,
                    size: 25,
                    needRootParentHash: true,
                    sourceFid: session?.profileId,
                    cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                }),
            });
            const { casts, cursor } = resolveFireflyResponseData(response);
            const data = casts.map((x) => formatFarcasterPostFromFirefly(x));

            return createPageable(
                data,
                indicator ?? createIndicator(),
                cursor ? createNextIndicator(indicator, cursor) : undefined,
            );
        }, true);
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/likes', {
                castHash: postId,
                size: 15,
                sourceFid: session?.profileId,
                cursor: indicator?.id,
            });
            const response = await fetchJSON<ReactorsResponse>(url, {
                method: 'GET',
            });
            const { items, nextCursor } = resolveFireflyResponseData(response);

            const data = items.map(formatFarcasterProfileFromFirefly);
            return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, nextCursor));
        });
    }

    async getRepostReactors(postId: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/recasters', {
                castHash: postId,
                size: 15,
                sourceFid: session?.profileId,
                cursor: indicator?.id,
            });
            const response = await fetchJSON<ReactorsResponse>(url, {
                method: 'GET',
            });
            const { items, nextCursor } = resolveFireflyResponseData(response);

            const data = items.map(formatFarcasterProfileFromFirefly);
            return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, nextCursor));
        });
    }

    // TODO: now for farcaster only, support other platforms in the future.
    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/search/identity', {
            keyword: q,
            size: 25,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<SearchProfileResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        const fids = compact(data.list.flatMap((x) => x.farcaster).map((x) => x?.platform_id));
        const result = await NeynarSocialMediaProvider.getProfilesByIds(fids);

        return createPageable(
            result,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/search', {
            keyword: q,
            limit: 25,
        });
        const response = await fetchJSON<SearchCastsResponse>(url, {
            method: 'GET',
        });
        const casts = resolveFireflyResponseData(response);
        const data = casts.map((cast) => {
            return {
                publicationId: cast.hash,
                type: (cast.parent_hash ? 'Comment' : 'Post') as PostType,
                source: Source.Farcaster,
                postId: cast.hash,
                parentPostId: cast.parent_hash,
                timestamp: Number(cast.created_at),
                author: formatFarcasterProfileFromFirefly(cast.author),
                metadata: {
                    locale: '',
                    content: {
                        content: cast.text,
                    },
                },
                stats: {
                    comments: Number(cast.replyCount),
                    mirrors: cast.recastCount,
                    quotes: cast.recastCount,
                    reactions: cast.likeCount,
                },
            } satisfies Post;
        });
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, ''));
    }

    async getUploadMediaToken(token: string) {
        if (!token) throw new Error('Need to login with Lens');
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/lens/public_uploadMediaToken');
        const response = await fetchJSON<UploadMediaTokenResponse>(url, {
            headers: {
                'x-access-token': token,
            },
        });
        return resolveFireflyResponseData(response);
    }

    async getFriendship(profileId: string) {
        return farcasterSessionHolder.withSession(async (session) => {
            if (!session) return;
            const response = await fetchJSON<FriendshipResponse>(
                urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/friendship', {
                    sourceFid: session?.profileId,
                    destFid: profileId,
                }),
                {
                    method: 'GET',
                },
            );
            return resolveFireflyResponseData(response);
        });
    }

    async getThreadByPostId(postId: string, localPost?: Post) {
        return farcasterSessionHolder.withSession(async (session) => {
            const post = localPost ?? (await this.getPostById(postId));

            const response = await fetchJSON<ThreadResponse>(
                urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/threads', {
                    sourceFid: session?.profileId,
                    hash: postId,
                    maxDepth: 25,
                }),
                {
                    method: 'GET',
                },
            );
            const data = resolveFireflyResponseData(response);
            return [post, ...data.threads.map((x) => formatFarcasterPostFromFirefly(x))];
        });
    }
    async reportUser(profileId: string): Promise<boolean> {
        // TODO Mocking result for now.
        return true;
    }
    async reportPost(post: Post): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async blockUser(profileId: string): Promise<boolean> {
        // TODO Mocking result for now.
        return true;
    }
    async unblockUser(profileId: string): Promise<boolean> {
        // TODO Mocking result for now.
        return true;
    }
    async getPostLikeProfiles(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }
    async bookmark(postId: string, profileId?: string, postType?: BookmarkType): Promise<boolean> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/bookmark/create');
        const response = await fireflySessionHolder.fetch<string>(url, {
            method: 'POST',
            body: JSON.stringify({
                platform: FireflyPlatform.Farcaster,
                platform_id: profileId,
                post_type: postType,
                post_id: postId,
            }),
        });
        if (response) return true;
        throw new Error('Failed to bookmark');
    }
    async unbookmark(postId: string): Promise<boolean> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/bookmark/remove');
        const response = await fireflySessionHolder.fetch<string>(url, {
            method: 'POST',
            body: JSON.stringify({
                post_ids: [postId],
            }),
        });
        if (response) return true;
        throw new Error('Failed to bookmark');
    }
    async getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/bookmark/find', {
            post_type: BookmarkType.All,
            platforms: 'farcaster',
            limit: 25,
            cursor: indicator?.id || undefined,
        });
        const response = await fireflySessionHolder.fetch<BookmarkResponse>(url);

        console.log('DEBUG: response');
        console.log(response);
        const posts = response.data?.list.map((x) => {
            return {
                ...formatFarcasterPostFromFirefly(x.post_content),
                hasBookmarked: true,
            };
        });

        return createPageable(
            posts || [],
            createIndicator(indicator),
            response.data?.cursor ? createNextIndicator(indicator, `${response.data.cursor}`) : undefined,
        );
    }
}

export const FireflySocialMediaProvider = new FireflySocialMedia();
