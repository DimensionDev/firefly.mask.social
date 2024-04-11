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
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { farcasterClient } from '@/configs/farcasterClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatFarcasterPostFromFirefly } from '@/helpers/formatFarcasterPostFromFirefly.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { NeynarSocialMediaProvider } from '@/providers/neynar/SocialMedia.js';
import type {
    CastResponse,
    CastsResponse,
    CommentsResponse,
    FriendshipResponse,
    NotificationResponse,
    ReactorsResponse,
    SearchCastsResponse,
    SearchProfileResponse,
    ThreadResponse,
    UploadMediaTokenResponse,
    UserResponse,
    UsersResponse,
} from '@/providers/types/Firefly.js';
import {
    type Notification,
    NotificationType,
    type Post,
    type PostType,
    type Profile,
    type Provider,
    type Reaction,
    SessionType,
} from '@/providers/types/SocialMedia.js';

export class FireflySocialMedia implements Provider {
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

    getPostsBeMentioned(
        profileId: string,
        indicator?: PageIndicator | undefined,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsLiked(profileId: string, indicator?: PageIndicator | undefined): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsReplies(profileId: string, indicator?: PageIndicator | undefined): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getReactors(postId: string, indicator?: PageIndicator | undefined): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    isFollowedByMe(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    isFollowingMe(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getSuggestedFollows(indicator?: PageIndicator | undefined): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async publishPost(post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async upvotePost(postId: string): Promise<Reaction> {
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
        return farcasterClient.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/discover/farcaster/timeline', {
                size: 20,
                cursor: indicator?.id,
                sourceFid: session?.profileId,
            });
            const { data } = await fetchJSON<CastsResponse>(url);

            const posts = data.casts.map((x) => formatFarcasterPostFromFirefly(x));
            return createPageable(
                posts,
                createIndicator(indicator),
                data.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
            );
        });
    }

    async getPostById(postId: string): Promise<Post> {
        return farcasterClient.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast', {
                hash: postId,
                fid: session?.profileId,
                needRootParentHash: true,
            });
            const { data: cast } = await fetchJSON<CastResponse>(url, {
                method: 'GET',
            });

            if (!cast) throw new Error('Post not found');
            return formatFarcasterPostFromFirefly(cast);
        });
    }

    async getProfileById(profileId: string): Promise<Profile> {
        return farcasterClient.withSession(async (session) => {
            const { data: user } = await farcasterClient.fetch<UserResponse>(
                urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/profile', {
                    fid: profileId,
                    sourceFid: session?.profileId,
                }),
                {
                    method: 'GET',
                },
            );

            const friendship = await this.getFriendship(profileId);

            return formatFarcasterProfileFromFirefly({
                ...user,
                ...friendship,
            });
        });
    }

    async getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followers', {
            fid: profileId,
            size: 10,
            cursor: indicator?.id,
        });
        const {
            data: { list, next_cursor },
        } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
        });
        const data = list.map(formatFarcasterProfileFromFirefly);

        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next_cursor));
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followings', {
            fid: profileId,
            size: 10,
            cursor: indicator?.id,
        });
        const {
            data: { list, next_cursor },
        } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
        });
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

        const {
            data: { comments, cursor },
        } = await fetchJSON<CommentsResponse>(url, {
            method: 'GET',
        });

        return createPageable(
            comments.map((item) => formatFarcasterPostFromFirefly(item)),
            indicator ?? createIndicator(indicator),
            cursor ? createNextIndicator(indicator, cursor) : undefined,
        );
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        return farcasterClient.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster');
            const {
                data: { casts, cursor },
            } = await fetchJSON<CastsResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    fids: [profileId],
                    size: 25,
                    sourceFid: session?.profileId,
                    cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                    needRootParentHash: true,
                }),
            });
            const data = casts.map((cast) => formatFarcasterPostFromFirefly(cast));

            return createPageable(
                data,
                createIndicator(indicator),
                cursor ? createNextIndicator(indicator, cursor) : undefined,
            );
        });
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const profileId = farcasterClient.sessionRequired.profileId;
        if (!profileId) throw new Error(t`Login required`);
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/notifications', {
            fid: profileId,
            sourceFid: profileId,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });
        const { data } = await fetchJSON<NotificationResponse>(url, { method: 'GET' });

        const result = data.notifications.map<Notification | undefined>((notification) => {
            const notificationId = `${profileId}_${notification.timestamp}_${notification.notificationType}`;
            const user = notification.user ? [formatFarcasterProfileFromFirefly(notification.user)] : EMPTY_LIST;
            const post = notification.cast ? formatFarcasterPostFromFirefly(notification.cast) : undefined;
            const timestamp = notification.timestamp ? new Date(notification.timestamp).getTime() : undefined;
            if (notification.notificationType === 1) {
                return {
                    source: SocialPlatform.Farcaster,
                    notificationId,
                    type: NotificationType.Reaction,
                    reactors: user,
                    post,
                    timestamp,
                };
            } else if (notification.notificationType === 2) {
                return {
                    source: SocialPlatform.Farcaster,
                    notificationId,
                    type: NotificationType.Mirror,
                    mirrors: user,
                    post,
                    timestamp,
                };
            } else if (notification.notificationType === 3) {
                const commentOn = notification.cast?.parentCast
                    ? formatFarcasterPostFromFirefly(notification.cast.parentCast)
                    : undefined;
                return {
                    source: SocialPlatform.Farcaster,
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
            } else if (notification.notificationType === 4) {
                return {
                    source: SocialPlatform.Farcaster,
                    notificationId,
                    type: NotificationType.Follow,
                    followers: user,
                };
            } else if (notification.notificationType === 5) {
                return {
                    source: SocialPlatform.Farcaster,
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

    async discoverPostsById(
        profileId: string,
        indicator?: PageIndicator | undefined,
    ): Promise<Pageable<Post, PageIndicator>> {
        return farcasterClient.withSession(async (session) => {
            // TODO: replace to prod url
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/timeline/farcaster_for_fid');

            const {
                data: { casts, cursor },
            } = await fetchJSON<CastsResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    fid: profileId,
                    size: 25,
                    needRootParentHash: true,
                    sourceFid: session?.profileId,
                    cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                }),
            });

            const data = casts.map((x) => formatFarcasterPostFromFirefly(x));
            return createPageable(
                data,
                indicator ?? createIndicator(),
                cursor ? createNextIndicator(indicator, cursor) : undefined,
            );
        });
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator) {
        return farcasterClient.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/likes', {
                castHash: postId,
                size: 15,
                sourceFid: session?.profileId,
                cursor: indicator?.id,
            });
            const {
                data: { items, nextCursor },
            } = await fetchJSON<ReactorsResponse>(url, {
                method: 'GET',
            });

            const data = items.map(formatFarcasterProfileFromFirefly);
            return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, nextCursor));
        });
    }

    async getMirrorReactors(postId: string, indicator?: PageIndicator) {
        return farcasterClient.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/recasters', {
                castHash: postId,
                size: 15,
                sourceFid: session?.profileId,
                cursor: indicator?.id,
            });
            const {
                data: { items, nextCursor },
            } = await fetchJSON<ReactorsResponse>(url, {
                method: 'GET',
            });

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

        const { data } = await fetchJSON<SearchProfileResponse>(url, {
            method: 'GET',
        });
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
        const { data: casts } = await fetchJSON<SearchCastsResponse>(url, {
            method: 'GET',
        });
        const data = casts.map((cast) => ({
            type: (cast.parent_hash ? 'Comment' : 'Post') as PostType,
            source: SocialPlatform.Farcaster,
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
        }));
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, ''));
    }

    async getUploadMediaToken(token: string) {
        if (!token) throw new Error('Need to login with Lens');
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/lens/public_uploadMediaToken');
        const res = await fetchJSON<UploadMediaTokenResponse>(url, {
            headers: {
                'x-access-token': token,
            },
        });

        return res.data;
    }

    async getFriendship(profileId: string) {
        return farcasterClient.withSession(async (session) => {
            const { data } = await fetchJSON<FriendshipResponse>(
                urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/friendship', {
                    sourceFid: session?.profileId,
                    destFid: profileId,
                }),
                {
                    method: 'GET',
                },
            );

            return data;
        });
    }

    async getThreadByPostId(postId: string) {
        return farcasterClient.withSession(async (session) => {
            const post = await this.getPostById(postId);

            const { data } = await fetchJSON<ThreadResponse>(
                urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/threads', {
                    sourceFid: session?.profileId,
                    hash: postId,
                    maxDepth: 25,
                }),
                {
                    method: 'GET',
                },
            );
            return [post, ...data.threads.map((x) => formatFarcasterPostFromFirefly(x))];
        });
    }
}

export const FireflySocialMediaProvider = new FireflySocialMedia();
