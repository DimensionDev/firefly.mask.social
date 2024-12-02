import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { BookmarkType, FireflyPlatform, Source, SourceInURL } from '@/constants/enum.js';
import { NotFoundError, NotImplementedError } from '@/constants/error.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import {
    formatBriefChannelFromFirefly,
    formatChannelFromFirefly,
    formatFireflyFarcasterProfile,
} from '@/helpers/formatFarcasterChannelFromFirefly.js';
import { formatFarcasterPostFromFirefly } from '@/helpers/formatFarcasterPostFromFirefly.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { formatSnapshotActivityFromFirefly } from '@/helpers/formatSnapshotFromFirefly.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { isZero } from '@/helpers/number.js';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@/helpers/pageable.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { NeynarSocialMediaProvider } from '@/providers/neynar/SocialMedia.js';
import { Snapshot } from '@/providers/snapshot/index.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';
import {
    type BlockChannelResponse,
    type BlockedChannelsResponse,
    type BlockedUsersResponse,
    type BookmarkResponse,
    type Cast,
    type CastResponse,
    type CastsOfChannelResponse,
    type CastsResponse,
    type ChannelResponse,
    type ChannelsResponse,
    type CommentsResponse,
    type DiscoverChannelsResponse,
    type DiscoverSnapshotsResponse,
    type FireflyFarcasterProfileResponse,
    type FireflySnapshotActivity,
    type FriendshipResponse,
    type NotificationPushSwitchResponse,
    type NotificationResponse,
    NotificationType as FireflyNotificationType,
    type PostQuotesResponse,
    type ReactorsResponse,
    type SearchCastsResponse,
    type SearchChannelsResponse,
    type SearchProfileResponse,
    type SetNotificationPushSwitchParams,
    type ThreadResponse,
    type UserResponse,
    type UsersResponse,
} from '@/providers/types/Firefly.js';
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
    SessionType,
} from '@/providers/types/SocialMedia.js';
import { getProfilesByIds } from '@/services/getProfilesByIds.js';
import { settings } from '@/settings/index.js';

export class FireflySocialMedia implements Provider {
    get type() {
        return SessionType.Farcaster;
    }

    getChannelsByIds(ids: string[]): Promise<Channel[]> {
        throw new NotImplementedError();
    }

    reportChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getForYouPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getRecentPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getChannelById(channelId: string): Promise<Channel> {
        return this.getChannelByHandle(channelId);
    }

    updateProfile(profile: ProfileEditable): Promise<boolean> {
        throw new NotImplementedError();
    }

    getProfileBadges(profile: Profile): Promise<ProfileBadge[]> {
        throw new NotImplementedError();
    }

    quotePost(postId: string, post: Post): Promise<string> {
        throw new NotImplementedError();
    }

    collectPost(postId: string, collectionId?: string): Promise<void> {
        throw new NotImplementedError();
    }

    getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new NotImplementedError();
    }

    getProfilesByIds(ids: string[]): Promise<Profile[]> {
        throw new NotImplementedError();
    }

    getPostsBeMentioned(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsLiked(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsReplies(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    isFollowedByMe(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    isFollowingMe(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    publishPost(post: Post): Promise<string> {
        throw new NotImplementedError();
    }
    deletePost(postId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    upvotePost(postId: string): Promise<void> {
        throw new NotImplementedError();
    }

    unvotePost(postId: string): Promise<void> {
        throw new NotImplementedError();
    }

    commentPost(postId: string, post: Post): Promise<string> {
        throw new NotImplementedError();
    }

    mirrorPost(postId: string): Promise<string> {
        throw new NotImplementedError();
    }

    unmirrorPost(postId: string): Promise<void> {
        throw new NotImplementedError();
    }

    follow(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unfollow(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    blockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unblockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    actPost(postId: string, options: unknown): Promise<void> {
        throw new NotImplementedError();
    }

    async getChannelByHandle(channelHandle: string): Promise<Channel> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel_v2', {
            channelHandle,
        });
        const response = await fireflySessionHolder.fetch<ChannelResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);

        return formatBriefChannelFromFirefly(data.channel, data.blocked);
    }

    async getChannelsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Channel, PageIndicator>> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/active_channels', {
            fid: profileId,
        });
        const response = await fetchJSON<ChannelsResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        const channels = data.map(formatChannelFromFirefly);
        return createPageable(channels, createIndicator(indicator));
    }
    // no cursor in response
    async discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/trending_channels', {
            // XXX It' will response empty list if the size is equal to or greater than 25.
            size: 20,
            cursor: indicator?.id,
        });
        const response = await fireflySessionHolder.fetch<DiscoverChannelsResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        const channels = data.map((x) => x.channel).map(formatChannelFromFirefly);
        return createPageable(channels, createIndicator(indicator), undefined);
    }

    getPostsByChannelId(channelId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return this.getPostsByChannelHandle(channelId, indicator);
    }

    getPostsByChannelHandle(channelHandle: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/casts', {
                channelHandle,
                fid: session?.profileId,
                size: 20,
                cursor: indicator?.id,
            });
            const response = await fireflySessionHolder.fetch<CastsOfChannelResponse>(url, {
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
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/search/channels', {
            keyword: q,
            size: 20,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<SearchChannelsResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        const channels = data.channels.map((x) => formatBriefChannelFromFirefly(x));

        return createPageable(
            channels,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    getChannelTrendingPosts(channel: Channel, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const profile = getCurrentProfile(Source.Farcaster);
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/trending_casts', {
                channelUrl: channel.url,
                channelHandle: channel.id,
                size: 20,
                cursor: indicator?.id,
                fid: session?.profileId,
                handle: profile?.handle,
            });
            const response = await fireflySessionHolder.fetch<CastsOfChannelResponse>(url, {
                method: 'GET',
            });
            const data = resolveFireflyResponseData(response);
            const posts = data.casts.map((x) => formatFarcasterPostFromFirefly(x));

            return createPageable(
                posts,
                createIndicator(indicator),
                data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
            );
        });
    }

    getProfileByHandle(handle: string): Promise<Profile> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/profile', {
                handle,
                sourceFid: session?.profileId,
            });
            const response = await fireflySessionHolder.fetch<FireflyFarcasterProfileResponse>(url);
            if (!response.data) {
                throw new Error(`Profile ${handle} doesn't exist.`);
            }
            return formatFireflyFarcasterProfile(response.data);
        });
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/discover/farcaster/timeline', {
                size: 20,
                cursor: indicator?.id,
                sourceFid: session?.profileId,
            });
            const response = await fireflySessionHolder.fetch<CastsResponse>(url);
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
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast', {
                hash: postId,
                fid: session?.profileId,
                needRootParentHash: true,
            });
            const { data: cast } = await fireflySessionHolder.fetch<CastResponse>(url, {
                method: 'GET',
            });

            const post = cast ? formatFarcasterPostFromFirefly(cast) : null;
            if (!post) throw new NotFoundError('Post not found');
            return post;
        });
    }

    async getProfileById(profileId: string): Promise<Profile> {
        return farcasterSessionHolder.withSession(async (session) => {
            const response = await fireflySessionHolder.fetch<UserResponse>(
                urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/profile', {
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

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/followers', {
                fid: profileId,
                size: 10,
                cursor: indicator?.id,
                sourceFid: session?.profileId,
            });
            const response = await fireflySessionHolder.fetch<UsersResponse>(url, {
                method: 'GET',
            });
            const { list, next_cursor } = resolveFireflyResponseData(response);
            const data = list.map(formatFarcasterProfileFromFirefly);

            return createPageable(
                data,
                createIndicator(indicator),
                next_cursor ? createNextIndicator(indicator, next_cursor) : undefined,
            );
        });
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/followings', {
                fid: profileId,
                size: 10,
                cursor: indicator?.id,
                sourceFid: session?.profileId,
            });
            const response = await fireflySessionHolder.fetch<UsersResponse>(url, {
                method: 'GET',
            });
            const { list, next_cursor } = resolveFireflyResponseData(response);
            const data = list.map(formatFarcasterProfileFromFirefly);

            return createPageable(
                data,
                createIndicator(indicator),
                next_cursor ? createNextIndicator(indicator, next_cursor) : undefined,
            );
        });
    }
    async getMutualFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/followersmutual', {
                fid: profileId,
                size: 10,
                cursor: indicator?.id,
                sourceFid: session?.profileId,
            });
            const response = await fireflySessionHolder.fetch<UsersResponse>(url, {
                method: 'GET',
            });
            const { list, next_cursor } = resolveFireflyResponseData(response);
            const data = list.map(formatFarcasterProfileFromFirefly);

            return createPageable(
                data,
                createIndicator(indicator),
                next_cursor ? createNextIndicator(indicator, next_cursor) : undefined,
            );
        });
    }

    async getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/comments', {
                hash: postId,
                size: 25,
                fid: session?.profileId,
                cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                priority: 'high',
            });
            const response = await fireflySessionHolder.fetch<CommentsResponse>(url, {
                method: 'GET',
            });
            const { comments, cursor } = resolveFireflyResponseData(response);

            return createPageable(
                comments.map((item) => formatFarcasterPostFromFirefly(item)),
                createIndicator(indicator),
                cursor ? createNextIndicator(indicator, cursor) : undefined,
            );
        });
    }

    async getHiddenComments(postId: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/comments', {
                hash: postId,
                size: 25,
                fid: session?.profileId,
                cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                priority: 'low',
            });
            const response = await fireflySessionHolder.fetch<CommentsResponse>(url, {
                method: 'GET',
            });
            const { comments, cursor } = resolveFireflyResponseData(response);

            return createPageable(
                comments.map((item) => formatFarcasterPostFromFirefly(item)),
                createIndicator(indicator),
                cursor ? createNextIndicator(indicator, cursor) : undefined,
            );
        });
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster/casts');
            const response = await fireflySessionHolder.fetch<CastsResponse>(url, {
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
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster/likes');
            const response = await fireflySessionHolder.fetch<CastsResponse>(url, {
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
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster');

            const response = await fireflySessionHolder.fetch<CastsResponse>(url, {
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
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/notifications/new', {
            fid: profileId,
            sourceFid: profileId,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });
        const response = await fireflySessionHolder.fetch<NotificationResponse>(url, { method: 'GET' });
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
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/timeline/farcaster');
            const response = await fireflySessionHolder.fetch<CastsResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    size: 25,
                    needRootParentHash: true,
                    sourceFid: profileId,
                    cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                }),
            });
            const { casts, cursor } = resolveFireflyResponseData(response);
            const data = casts.map((x) => formatFarcasterPostFromFirefly(x));

            return createPageable(
                data,
                createIndicator(indicator),
                cursor ? createNextIndicator(indicator, cursor) : undefined,
            );
        }, true);
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/likes', {
                castHash: postId,
                size: 15,
                sourceFid: session?.profileId,
                cursor: indicator?.id,
            });
            const response = await fireflySessionHolder.fetch<ReactorsResponse>(url, {
                method: 'GET',
            });
            const { items, nextCursor } = resolveFireflyResponseData(response);

            const data = items.map(formatFarcasterProfileFromFirefly);
            return createPageable(
                data,
                createIndicator(indicator),
                nextCursor ? createNextIndicator(indicator, nextCursor) : undefined,
            );
        });
    }

    async getRepostReactors(postId: string, indicator?: PageIndicator) {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/recasters', {
                castHash: postId,
                size: 15,
                sourceFid: session?.profileId,
                cursor: indicator?.id,
            });
            const response = await fireflySessionHolder.fetch<ReactorsResponse>(url, {
                method: 'GET',
            });
            const { items, nextCursor } = resolveFireflyResponseData(response);

            const data = items.map(formatFarcasterProfileFromFirefly);
            return createPageable(
                data,
                createIndicator(indicator),
                nextCursor ? createNextIndicator(indicator, nextCursor) : undefined,
            );
        });
    }

    // TODO: now for farcaster only, support other platforms in the future.
    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/search/identity', {
            keyword: q,
            size: 25,
            cursor: indicator?.id,
        });
        const response = await fireflySessionHolder.fetch<SearchProfileResponse>(url, {
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
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/search', {
                keyword: q,
                limit: 25,
                sourceFid: session?.profileId,
            });
            const response = await fireflySessionHolder.fetch<SearchCastsResponse>(url);
            const casts = resolveFireflyResponseData(response);
            const data = casts.map((cast) => formatFarcasterPostFromFirefly(cast));
            return createPageable(data, createIndicator(indicator), undefined);
        });
    }

    async getFriendship(profileId: string) {
        return farcasterSessionHolder.withSession(async (session) => {
            if (!session) return null;
            const response = await fetchJSON<FriendshipResponse>(
                urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/friendship', {
                    sourceFid: session?.profileId,
                    destFid: profileId,
                }),
                {
                    method: 'GET',
                },
            );
            return resolveFireflyResponseData<Friendship>(response);
        });
    }

    async getThreadByPostId(postId: string, localPost?: Post) {
        return farcasterSessionHolder.withSession(async (session) => {
            const post = localPost ?? (await this.getPostById(postId));

            const response = await fireflySessionHolder.fetch<ThreadResponse>(
                urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/threads', {
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

    async getBlockedProfiles(
        indicator?: PageIndicator,
        source?: Exclude<SourceInURL, SourceInURL.Article>,
    ): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/platformMuteList', {
            size: 20,
            page: indicator?.id ?? 1,
            platform: source,
        });
        const response = await fireflySessionHolder.fetch<BlockedUsersResponse>(url);
        const ids = response.data?.blocks.map((x) => x.snsId);
        const profiles: Profile[] = ids?.length && source ? await getProfilesByIds(source, ids) : EMPTY_LIST;

        const blockedProfiles: Profile[] = profiles.map((profile) => ({
            ...profile,
            // since we use our own mute system, we need to set blocking to true manually
            viewerContext: { ...profile.viewerContext, blocking: true },
        }));

        return createPageable(
            blockedProfiles,
            createIndicator(indicator),
            response.data?.nextPage ? createNextIndicator(indicator, `${response.data?.nextPage}`) : undefined,
        );
    }

    async getBlockedChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            if (!session) {
                throw new Error('No farcaster session found');
            }

            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/blocks', {
                account_id: session.profileId,
            });
            const response = await fireflySessionHolder.fetch<BlockedChannelsResponse>(url);
            const channelIds = response.data?.map((x) => x.channel_id);
            const channels = channelIds?.length
                ? await NeynarSocialMediaProvider.getChannelsByIds(channelIds)
                : EMPTY_LIST;
            return createPageable(channels, createIndicator(indicator), undefined);
        });
    }

    async getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/quotes', {
            hash: postId,
            size: 20,
            cursor: indicator?.id,
            needRootParentHash: true,
        });
        const response = await fireflySessionHolder.fetch<PostQuotesResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        const posts = data.quotes.map((x) => formatFarcasterPostFromFirefly(x));

        return createPageable(
            posts,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
        );
    }

    async bookmark(
        postId: string,
        platform?: FireflyPlatform,
        profileId?: string,
        postType?: BookmarkType,
    ): Promise<boolean> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/bookmark/create');
        const response = await fireflySessionHolder.fetch<string>(url, {
            method: 'POST',
            body: JSON.stringify({
                platform: platform ?? FireflyPlatform.Farcaster,
                platform_id: profileId,
                post_type: postType,
                post_id: postId,
            }),
        });
        if (response) return true;
        throw new Error('Failed to bookmark.');
    }

    async unbookmark(postId: string): Promise<boolean> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/bookmark/remove');
        const response = await fireflySessionHolder.fetch<string>(url, {
            method: 'POST',
            body: JSON.stringify({
                post_ids: [postId],
            }),
        });
        if (response) return true;
        throw new Error('Failed to remove bookmark.');
    }

    async getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/bookmark/find', {
                post_type: BookmarkType.All,
                platforms: FireflyPlatform.Farcaster,
                limit: 25,
                cursor: indicator?.id || undefined,
                fid: session?.profileId,
            });
            const response = await fireflySessionHolder.fetch<BookmarkResponse<Cast>>(url);

            const posts = compact(
                response.data?.list.map((x) => {
                    if (!x.post_content) return null;
                    const formatted = formatFarcasterPostFromFirefly(x.post_content);
                    if (!formatted) return null;
                    return {
                        ...formatted,
                        hasBookmarked: true,
                    };
                }),
            );

            return createPageable(
                posts,
                createIndicator(indicator),
                response.data?.cursor ? createNextIndicator(indicator, `${response.data.cursor}`) : undefined,
            );
        });
    }

    async blockChannel(channelId: string): Promise<boolean> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/block');
        const response = await fireflySessionHolder.fetch<BlockChannelResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                channel_id: channelId,
            }),
        });

        if (response) return true;
        throw new Error('Failed to mute channel');
    }

    async unblockChannel(channelId: string): Promise<boolean> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/block');
        const response = await fireflySessionHolder.fetch<BlockChannelResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({
                channel_id: channelId,
            }),
        });

        if (response) return true;
        throw new Error('Failed to mute channel');
    }

    async reportPost(post: Post): Promise<boolean> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/report/post/create');
        await fireflySessionHolder.fetch<string>(url, {
            method: 'POST',
            body: JSON.stringify({
                platform: resolveSourceInUrl(post.source),
                platform_id: post.author.profileId,
                post_type: 'text',
                post_id: post.postId,
            }),
        });
        return true;
    }

    async discoverSnapshotActivity(indicator?: PageIndicator) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/discover/snapshot/timeline', {
            size: 20,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const response = await fireflySessionHolder.fetch<DiscoverSnapshotsResponse>(url);

        const data = resolveFireflyResponseData(response);
        const proposals = await Snapshot.getProposals(data.result.map((x) => x.metadata.proposal_id));

        const activities = data.result.map((x) => {
            const proposal = proposals.find((p) => p.id === x.metadata.proposal_id);

            return {
                ...formatSnapshotActivityFromFirefly(x),
                proposal,
            };
        });

        return createPageable(
            activities,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    async getFollowingSnapshotActivity({
        indicator,
        walletAddresses,
    }: {
        indicator?: PageIndicator;
        walletAddresses?: string[];
    }) {
        const url = urlcat(
            settings.FIREFLY_ROOT_URL,
            walletAddresses && walletAddresses.length > 0 ? '/v1/user/timeline/snapshot' : '/v1/timeline/snapshot',
        );

        const response = await fireflySessionHolder.fetch<DiscoverSnapshotsResponse>(
            url,
            {
                method: 'POST',
                body: JSON.stringify({
                    size: 20,
                    cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                    walletAddresses,
                }),
            },
            {
                withSession: !(walletAddresses && walletAddresses.length > 0),
            },
        );

        const data = resolveFireflyResponseData(response);
        const proposals = await Snapshot.getProposals(data.result.map((x) => x.metadata.proposal_id));

        const activities = data.result.map((x) => {
            const proposal = proposals.find((p) => p.id === x.metadata.proposal_id);

            return {
                ...formatSnapshotActivityFromFirefly(x),
                proposal,
            };
        });

        return createPageable(
            activities,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    async getSnapshotBookmarks(indicator?: PageIndicator): Promise<Pageable<SnapshotActivity, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/bookmark/find', {
                post_type: BookmarkType.All,
                platforms: FireflyPlatform.Snapshot,
                limit: 25,
                cursor: indicator?.id || undefined,
                fid: session?.profileId,
            });
            const response = await fireflySessionHolder.fetch<BookmarkResponse<FireflySnapshotActivity>>(url);

            const data = resolveFireflyResponseData(response);
            const proposals = await Snapshot.getProposals(
                compact(data.list.map((x) => x.post_content?.metadata.proposal_id)),
            );

            const activities = compact(
                data.list.map((x) => {
                    if (!x.post_content) return;
                    const proposal = proposals.find((p) => p.id === x.post_content?.metadata.proposal_id);

                    return {
                        ...formatSnapshotActivityFromFirefly(x.post_content),
                        proposal,
                    };
                }),
            );

            return createPageable(
                activities,
                createIndicator(indicator),
                data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
            );
        });
    }

    async getNotificationPushSwitch() {
        const response = await fireflySessionHolder.fetch<NotificationPushSwitchResponse>(
            urlcat(settings.FIREFLY_ROOT_URL, '/v1/notification/pushswitch/get'),
        );
        return resolveFireflyResponseData(response);
    }

    async setNotificationPushSwitch(params: SetNotificationPushSwitchParams) {
        const response = await fireflySessionHolder.fetch<NotificationPushSwitchResponse>(
            urlcat(settings.FIREFLY_ROOT_URL, '/v1/notification/pushswitch/set'),
            {
                method: 'POST',
                body: JSON.stringify(params),
            },
        );
        return resolveFireflyResponseData(response);
    }

    async joinChannel(channel: Channel): Promise<boolean> {
        throw new NotImplementedError();
    }

    async leaveChannel(channel: Channel): Promise<boolean> {
        throw new NotImplementedError();
    }
}

export const FireflySocialMediaProvider = new FireflySocialMedia();
