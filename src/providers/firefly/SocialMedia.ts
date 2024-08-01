import { t } from '@lingui/macro';
import dayjs from 'dayjs';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';
import { v4 as uuid } from 'uuid';
import { type Hex, isAddress } from 'viem';

import { BookmarkType, FireflyPlatform, type SocialSource, Source, SourceInURL } from '@/constants/enum.js';
import { NotFoundError, NotImplementedError } from '@/constants/error.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { SetQueryDataForAddWallet } from '@/decorators/SetQueryDataForAddWallet.js';
import { SetQueryDataForMuteAllProfiles } from '@/decorators/SetQueryDataForBlockProfile.js';
import { SetQueryDataForBlockWallet, SetQueryDataForMuteAllWallets } from '@/decorators/SetQueryDataForBlockWallet.js';
import {
    SetQueryDataForDeleteWallet,
    SetQueryDataForReportAndDeleteWallet,
} from '@/decorators/SetQueryDataForDeleteWallet.js';
import { SetQueryDataForWatchWallet } from '@/decorators/SetQueryDataForWatchWallet.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import {
    formatBriefChannelFromFirefly,
    formatChannelFromFirefly,
    formatFireflyFarcasterProfile,
} from '@/helpers/formatFarcasterChannelFromFirefly.js';
import { formatFarcasterPostFromFirefly } from '@/helpers/formatFarcasterPostFromFirefly.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { formatFireflyProfilesFromWalletProfiles } from '@/helpers/formatFireflyProfilesFromWalletProfiles.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getPlatformQueryKey } from '@/helpers/getPlatformQueryKey.js';
import { isZero } from '@/helpers/number.js';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@/helpers/pageable.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { NeynarSocialMediaProvider } from '@/providers/neynar/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';
import {
    type BindWalletResponse,
    type BlockChannelResponse,
    type BlockedChannelsResponse,
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
    type FireflyFarcasterProfileResponse,
    type FireflyProfile,
    type FriendshipResponse,
    type IsMutedAllResponse,
    type MuteAllResponse,
    type NotificationResponse,
    NotificationType as FireflyNotificationType,
    type PostQuotesResponse,
    type ReactorsResponse,
    type RelationResponse,
    type ReportPostParams,
    type Response,
    type SchedulePostPayload,
    type ScheduleTasksResponse,
    type SearchCastsResponse,
    type SearchChannelsResponse,
    type SearchProfileResponse,
    type ThreadResponse,
    type UploadMediaTokenResponse,
    type UserResponse,
    type UsersResponse,
    type WalletProfileResponse,
    WatchType,
} from '@/providers/types/Firefly.js';
import type { DiscoverNFTResponse, GetFollowingNFTResponse } from '@/providers/types/NFTs.js';
import {
    type Channel,
    type Notification,
    NotificationType,
    type Post,
    type Profile,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import { getProfilesByIds } from '@/services/getProfilesByIds.js';
import { settings } from '@/settings/index.js';
import type { ComposeType } from '@/types/compose.js';

async function reportPost(params: ReportPostParams) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/report/post/create');
    return fireflySessionHolder.fetch<string>(url, {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

async function block(field: BlockFields, profileId: string): Promise<boolean> {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/block');
    const response = await fireflySessionHolder.fetch<BlockUserResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
            [field]: profileId,
        }),
    });
    if (response) return true;
    throw new Error('Failed to block user');
}

async function unblock(field: BlockFields, profileId: string): Promise<boolean> {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/unblock');
    const response = await fireflySessionHolder.fetch<BlockUserResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
            [field]: profileId,
        }),
    });
    if (response) return true;
    throw new Error('Failed to mute user');
}

@SetQueryDataForAddWallet()
@SetQueryDataForDeleteWallet()
@SetQueryDataForReportAndDeleteWallet()
@SetQueryDataForWatchWallet()
@SetQueryDataForBlockWallet()
@SetQueryDataForMuteAllProfiles()
@SetQueryDataForMuteAllWallets()
export class FireflySocialMedia implements Provider {
    getChannelById(channelId: string): Promise<Channel> {
        return this.getChannelByHandle(channelId);
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

    async publishPost(post: Post): Promise<string> {
        throw new NotImplementedError();
    }
    async deletePost(postId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    async upvotePost(postId: string): Promise<void> {
        throw new NotImplementedError();
    }

    async unvotePost(postId: string) {
        throw new NotImplementedError();
    }

    async commentPost(postId: string, post: Post): Promise<string> {
        throw new NotImplementedError();
    }

    async mirrorPost(postId: string): Promise<string> {
        throw new NotImplementedError();
    }

    async unmirrorPost(postId: string) {
        throw new NotImplementedError();
    }

    async follow(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    async unfollow(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    async blockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    async unblockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    get type() {
        return SessionType.Farcaster;
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

    async getAllPlatformProfileByIdentity(source: Source, identity: string): Promise<FireflyProfile[]> {
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

        const url = urlcat(
            settings.FIREFLY_ROOT_URL,
            '/v2/wallet/profile',
            queryKey ? { [`${queryKey}`]: identity } : {},
        );

        const response = await fireflySessionHolder.fetch<WalletProfileResponse>(url, {
            method: 'GET',
        });

        const profiles = resolveFireflyResponseData(response);

        return formatFireflyProfilesFromWalletProfiles(profiles);
    }

    async getAllPlatformProfiles(lensHandle?: string, fid?: string, twitterId?: string): Promise<FireflyProfile[]> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/wallet/profile', {
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
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet/relations', {
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

    async searchIdentity(q: string, platforms?: SocialSource[]) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/search/identity', {
            keyword: q,
            size: 100,
        });

        const response = await fireflySessionHolder.fetch<SearchProfileResponse>(url, {
            method: 'GET',
        });

        return response.data;
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

    async getUploadMediaToken(token: string) {
        if (!token) throw new Error('Need to login with Lens');
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/lens/public_uploadMediaToken');
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
                urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/friendship', {
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
            const profile = getCurrentProfile(Source.Farcaster);

            const response = await fireflySessionHolder.fetch<ThreadResponse>(
                urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast/threads', {
                    sourceFid: session?.profileId,
                    sourceHandle: profile?.handle,
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
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/blocklist', {
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

    async getPostLikeProfiles(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
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
                platforms: 'farcaster',
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

    async isProfileMuted(platform: FireflyPlatform, profileId: string): Promise<boolean> {
        return farcasterSessionHolder.withSession(async (session) => {
            if (!session) return false;
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/blockRelation');
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

    async blockWallet(address: string) {
        return block('address', address);
    }

    async unblockWallet(address: string) {
        return unblock('address', address);
    }

    async blockProfileFor(source: FireflyPlatform, profileId: string): Promise<boolean> {
        return block(getPlatformQueryKey(resolveSourceFromUrl(source)), profileId);
    }

    async unblockProfileFor(source: FireflyPlatform, profileId: string): Promise<boolean> {
        return unblock(getPlatformQueryKey(resolveSourceFromUrl(source)), profileId);
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

    async watchWallet(address: string) {
        if (!isAddress(address)) throw new Error(`Invalid address: ${address}`);
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/follow', {
            type: WatchType.Wallet,
            toObjectId: address,
        });
        await fireflySessionHolder.fetch<Response<void>>(url, { method: 'PUT' });
        return true;
    }

    async unwatchWallet(address: string) {
        if (!isAddress(address)) throw new Error(`Invalid address: ${address}`);
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/follow', {
            type: WatchType.Wallet,
            toObjectId: address,
        });
        await fireflySessionHolder.fetch<Response<void>>(url, { method: 'DELETE' });
        return true;
    }

    async reportProfile(profileId: string): Promise<boolean> {
        // TODO Mocking result for now.
        return true;
    }

    async reportPost(post: Post): Promise<boolean> {
        await reportPost({
            platform: resolveSourceInURL(post.source),
            platform_id: post.author.profileId,
            post_type: 'text',
            post_id: post.postId,
        });
        return true;
    }

    async reportArticle(article: Article) {
        return reportPost({
            platform: FireflyPlatform.Article,
            platform_id: article.author.id,
            post_type: 'text',
            post_id: article.id,
        });
    }

    async discoverNFTs({
        indicator,
        limit = 40,
    }: {
        indicator?: PageIndicator;
        limit?: number;
    } = {}) {
        const page = Number.parseInt(indicator?.id || '0', 10);
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/discover/feeds', {
            size: limit,
            offset: page * limit,
        });
        const response = await fireflySessionHolder.fetch<DiscoverNFTResponse>(url, {
            method: 'GET',
        });
        return createPageable(
            response.data.feeds,
            indicator,
            response.data.hasMore ? createIndicator(undefined, `${page + 1}`) : undefined,
        );
    }

    async getFollowingNFTs({
        limit = 40,
        indicator,
        walletAddresses,
    }: {
        limit?: number;
        indicator?: PageIndicator;
        walletAddresses?: string[];
    } = {}) {
        const url = urlcat(
            settings.FIREFLY_ROOT_URL,
            walletAddresses && walletAddresses.length > 0 ? '/v2/user/timeline/nft' : '/v2/timeline/nft',
        );
        const response = await fireflySessionHolder.fetch<GetFollowingNFTResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                size: limit,
                cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                walletAddresses,
            }),
        });
        return createPageable(
            response.data.result,
            indicator,
            response.data.cursor ? createIndicator(undefined, response.data.cursor) : undefined,
        );
    }

    async schedulePost(
        scheduleTime: Date,
        posts: SchedulePostPayload[],
        displayInfo: { content: string; type: ComposeType },
    ) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/schedule');

        const response = await fireflySessionHolder.fetch<Response<string>>(
            url,
            {
                method: 'POST',
                body: JSON.stringify({
                    scheduleTime: dayjs(scheduleTime).toISOString(),
                    posts,
                    display_info: JSON.stringify(displayInfo),
                    ua_type: 'web',
                    groupId: uuid(),
                }),
            },
            true,
        );
        if (response.data) return true;
        throw new Error(t`Failed to create scheduled post.`);
    }

    async updateScheduledPost(id: string, scheduleTime: Date) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/updateTasks');
        const response = await fireflySessionHolder.fetch<Response<string>>(
            url,
            {
                method: 'POST',
                body: JSON.stringify({
                    taskUUID: id,
                    publishTime: dayjs(scheduleTime).toISOString(),
                    ua_type: 'web',
                }),
            },
            true,
        );
        if (response.data) return true;
        throw new Error(t`Failed to update scheduled post.`);
    }

    async deleteScheduledPost(id: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/deleteTask');
        const response = await fireflySessionHolder.fetch<Response<string>>(
            url,
            {
                method: 'POST',
                body: JSON.stringify({
                    taskUUID: id,
                }),
            },
            true,
        );
        if (response.data) return true;
        throw new Error(t`Failed to delete scheduled post.`);
    }

    async getScheduledPosts(indicator?: PageIndicator) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/tasks');
        const response = await fireflySessionHolder.fetch<ScheduleTasksResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                cursor: indicator?.id,
                size: 20,
            }),
        });

        const data = resolveFireflyResponseData(response);

        return createPageable(
            data.tasks,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
        );
    }

    async getMessageToSignForBindWallet(address: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet/messageToSign', {
            address,
        });

        const response = await fireflySessionHolder.fetch<Response<{ message: Hex }>>(url, {
            method: 'GET',
        });

        const { message } = resolveFireflyResponseData(response);

        if (!message) throw new Error('Failed to get message to sign');

        return message;
    }

    async verifyAndBindWallet(signMessage: string, signature: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet/verify');

        const response = await fireflySessionHolder.fetch<BindWalletResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                signMessage,
                signature,
            }),
        });

        const data = resolveFireflyResponseData(response);

        return data;
    }

    async deleteWallet(addresses: string[]) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet');

        await fireflySessionHolder.fetch<Response<void>>(url, {
            method: 'DELETE',
            body: JSON.stringify({
                addresses,
            }),
        });
    }

    async reportAndDeleteWallet(options: {
        twitterId: string;
        walletAddress: string;
        reportReason: string;
        sources: string[];
    }) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet/twitter/wallet/report');

        await fireflySessionHolder.fetch<Response<void>>(url, {
            method: 'POST',
            body: JSON.stringify({
                ...options,
                sources: options.sources.join(','),
            }),
        });
    }

    async isProfileMutedAll(source: Source, identity: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/isMuteAll', {
            [getPlatformQueryKey(source)]: identity,
        });

        const response = await fireflySessionHolder.fetch<IsMutedAllResponse>(url);
        const data = resolveFireflyResponseData(response);

        return data?.isBlockAll ?? false;
    }

    async muteProfileAll(source: Source, identity: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/muteAll', {
            [getPlatformQueryKey(source)]: identity,
        });

        const response = await fireflySessionHolder.fetch<MuteAllResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                [getPlatformQueryKey(source)]: identity,
            }),
        });

        return resolveFireflyResponseData(response);
    }
}

export const FireflySocialMediaProvider = new FireflySocialMedia();
