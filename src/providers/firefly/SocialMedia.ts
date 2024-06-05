import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { EMPTY_LIST } from '@masknet/shared-base';
import { isZero } from '@masknet/web3-shared-base';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { BookmarkType, FireflyPlatform, Source, SourceInURL } from '@/constants/enum.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { SetQueryDataForBlockWallet } from '@/decorators/SetQueryDataForBlockWallet.js';
import { SetQueryDataForWatchWallet } from '@/decorators/SetQueryDataForWatchWallet.js';
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
import type { Article } from '@/providers/types/Article.js';
import {
    type BlockChannelResponse,
    type BlockedUsersResponse,
    type BlockFields,
    type BlockRelationResponse,
    type BlockUserResponse,
    type BookmarkResponse,
    type Cast,
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
    type PostQuotesResponse,
    type ReactorsResponse,
    type RelationResponse,
    type ReportPostParams,
    type Response,
    type SearchCastsResponse,
    type SearchChannelsResponse,
    type SearchProfileResponse,
    type ThreadResponse,
    type TwitterFollowStatusResponse,
    type UploadMediaTokenResponse,
    type UserResponse,
    type UsersResponse,
    type WalletProfileResponse,
    type WalletsFollowStatusResponse,
} from '@/providers/types/Firefly.js';
import {
    type Channel,
    type Notification,
    NotificationType,
    type Post,
    type Profile,
    type Provider,
    SessionType,
    WatchType,
} from '@/providers/types/SocialMedia.js';

@SetQueryDataForWatchWallet()
@SetQueryDataForBlockWallet()
export class FireflySocialMedia implements Provider {
    getChannelById(channelId: string): Promise<Channel> {
        return this.getChannelByHandle(channelId);
    }

    async getChannelByHandle(channelHandle: string): Promise<Channel> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel_v2', {
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
    // no cursor in response
    async discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/trending_channels', {
            size: 25,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<DiscoverChannelsResponse>(url, {
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/casts', {
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
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/search/channels', {
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

    async follow(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async unfollow(profileId: string): Promise<boolean> {
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast', {
                hash: postId,
                fid: session?.profileId,
                needRootParentHash: true,
            });
            const { data: cast } = await fireflySessionHolder.fetch<CastResponse>(url, {
                method: 'GET',
            });

            const post = cast ? formatFarcasterPostFromFirefly(cast) : null;
            if (!post) throw new Error('Post not found');
            return post;
        });
    }

    async getProfileById(profileId: string): Promise<Profile> {
        return farcasterSessionHolder.withSession(async (session) => {
            const response = await fireflySessionHolder.fetch<UserResponse>(
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
        return farcasterSessionHolder.withSession(async (session) => {
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followers', {
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followings', {
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/comments', {
                hash: postId,
                size: 25,
                fid: session?.profileId,
                cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster/casts');
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster/likes');
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster');

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
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/notifications/new', {
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/timeline/farcaster');
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/likes', {
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/recasters', {
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
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/search/identity', {
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
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/search', {
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

            const response = await fireflySessionHolder.fetch<ThreadResponse>(
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
    private async report_post(params: ReportPostParams) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/report/post/create');
        return fireflySessionHolder.fetch<string>(url, {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }
    async reportPost(post: Post): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async reportArticle(article: Article) {
        return this.report_post({
            platform: FireflyPlatform.Article,
            platform_id: article.author.id,
            post_type: 'text',
            post_id: article.id,
        });
    }
    private async block(field: BlockFields, profileId: string): Promise<boolean> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/user/block');
        const response = await fireflySessionHolder.fetch<BlockUserResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                [field]: profileId,
            }),
        });
        if (response) return true;
        throw new Error('Failed to block user');
    }
    private async unblock(field: BlockFields, profileId: string): Promise<boolean> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/user/unblock');
        const response = await fireflySessionHolder.fetch<BlockUserResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                [field]: profileId,
            }),
        });
        if (response) return true;
        throw new Error('Failed to mute user');
    }
    async blockUser(profileId: string): Promise<boolean> {
        return this.block('fid', profileId);
    }
    async unblockUser(profileId: string): Promise<boolean> {
        return this.unblock('fid', profileId);
    }

    async getBlockedProfiles(
        indicator?: PageIndicator,
        source?: Exclude<SourceInURL, SourceInURL.Article>,
    ): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/user/blocklist', {
            size: 20,
            page: indicator?.id ?? 1,
            platform: source,
        });
        const response = await fireflySessionHolder.fetch<BlockedUsersResponse>(url);
        const fids = response.data?.blocks.map((x) => x.snsId);
        const profiles: Profile[] = fids?.length ? await NeynarSocialMediaProvider.getProfilesByIds(fids) : EMPTY_LIST;
        return createPageable(
            profiles,
            createIndicator(indicator),
            response.data?.nextPage ? createNextIndicator(indicator, `${response.data?.nextPage}`) : undefined,
        );
    }

    async blockChannel(channelId: string): Promise<boolean> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/block');

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
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/block');

        const response = await fireflySessionHolder.fetch<BlockChannelResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({
                channel_id: channelId,
            }),
        });

        if (response) return true;
        throw new Error('Failed to mute channel');
    }

    async blockAddress(address: string) {
        return this.block('address', address);
    }
    async unblockAddress(address: string) {
        return this.unblock('address', address);
    }

    async getBlockedChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        return farcasterSessionHolder.withSession(async (session) => {
            if (!session) {
                throw new Error('No farcaster session found');
            }
            // FIXME: this interface is not implemented in the backend now, just document.
            const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/channel/blocks', {
                account_id: session.profileId,
            });
            const response = await fireflySessionHolder.fetch<ChannelsResponse>(url);
            const data = resolveFireflyResponseData(response);
            return createPageable(data.map(formatChannelFromFirefly), createIndicator(indicator), undefined);
        });
    }

    async getPostLikeProfiles(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/quotes', {
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
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/bookmark/create');
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
    }

    async getIsMuted(platform: FireflyPlatform, profileId: string): Promise<boolean> {
        return farcasterSessionHolder.withSession(async (session) => {
            if (!session) return false;
            const url = urlcat(FIREFLY_ROOT_URL, '/v1/user/blockRelation');
            const response = await fireflySessionHolder.fetch<BlockRelationResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    conditions: [{ snsPlatform: platform, snsId: profileId }],
                }),
            });
            const blocked = !!response.data?.find((x) => x.snsId === profileId)?.blocked;
            return blocked;
        });
    }

    async watch(type: WatchType, id: string) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/user/follow', {
            toObjectId: id,
            type,
        });
        await fireflySessionHolder.fetch<Response<void>>(url, { method: 'put' });
        return true;
    }
    /**
     * @param {WatchType} type
     * @param {string} id - id for maskx, userId for twitter, address for wallet
     */
    async unwatch(type: WatchType, id: string) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/user/follow', {
            toObjectId: id,
            type,
        });
        await fireflySessionHolder.fetch<Response<void>>(url, { method: 'delete' });
        return true;
    }

    async getIsWatch(type: WatchType, id: string): Promise<boolean> {
        if (type === WatchType.MaskX) {
            throw new TypeError(`${type} is not supported yet.`);
        }
        if (type === WatchType.Twitter) {
            const url = urlcat(FIREFLY_ROOT_URL, '/v1/user/follow', { twitterId: id });
            const res = await fireflySessionHolder.fetch<TwitterFollowStatusResponse>(url);
            return !!res.data?.isFollowed;
        } else if (type === WatchType.Wallet) {
            const url = urlcat(FIREFLY_ROOT_URL, '/v1/user/follow/wallet');
            const res = await fireflySessionHolder.fetch<WalletsFollowStatusResponse>(url, {
                method: 'post',
                body: JSON.stringify({
                    addresses: [id],
                }),
            });
            if (!res.data) return false;
            const address = id.toLowerCase();
            const is_followed = res.data.find((x) => address === x.address.toLowerCase())?.is_followed;
            return !!is_followed;
        }
        return false;
    }
}

export const FireflySocialMediaProvider = new FireflySocialMedia();
