import { t } from '@lingui/macro';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { isZero, resolveCrossOriginURL } from '@masknet/web3-shared-base';
import { compact, first } from 'lodash-es';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { WARPCAST_CLIENT_URL, WARPCAST_ROOT_URL } from '@/constants/index.js';
import { formatWarpcastPost, formatWarpcastPostFromFeed } from '@/helpers/formatWarpcastPost.js';
import { formatWarpcastUser } from '@/helpers/formatWarpcastUser.js';
import { removeLeadingHash } from '@/helpers/removeLeadingHash.js';
import { toFid } from '@/helpers/toFid.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
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
import {
    type BookmarkedCastsResponse,
    type Cast,
    type CastResponse,
    type CastsResponse,
    type FeedResponse,
    type LikesResponse,
    type NotificationResponse,
    type ReactionResponse,
    type RecastersResponse,
    type SearchCastsResponse,
    type SearchUsersResponse,
    type SuccessResponse,
    type UserDetailResponse,
    type UsersResponse,
} from '@/providers/types/Warpcast.js';

class WarpcastSocialMedia implements Provider {
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

    getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getThreadByPostId(postId: string, localPost?: Post): Promise<Post[]> {
        throw new Error('Method not implemented.');
    }

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

    get type() {
        return SessionType.Farcaster;
    }

    /**
     * @deprecated
     * Response data doesn't include viewer context
     */
    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/popular-casts-feed', {
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await farcasterSessionHolder.fetch<CastsResponse>(resolveCrossOriginURL(url), {
            method: 'GET',
        });
        const data = result.casts.map(formatWarpcastPost);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async discoverPostsById(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/home-feed', {
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await farcasterSessionHolder.fetch<FeedResponse>(
            url,
            {
                method: 'GET',
            },
            true,
        );
        const data = result.feed.map(formatWarpcastPostFromFeed);

        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts', {
            fid: toFid(profileId),
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await farcasterSessionHolder.fetch<CastsResponse>(url);
        const data = result.casts.map(formatWarpcastPost);

        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
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
        throw new Error('Method not implemented.');
    }

    async getPostById(postId: string): Promise<Post> {
        const castUrl = urlcat(WARPCAST_ROOT_URL, '/cast', { hash: postId });
        const {
            result: { cast },
        } = await farcasterSessionHolder.fetch<{ result: { cast: Cast } }>(castUrl, {
            method: 'GET',
        });

        const url = urlcat(WARPCAST_ROOT_URL, '/user-thread-casts', {
            castHashPrefix: postId.slice(0, 10),
            limit: 5,
            username: cast.author.username,
        });
        const {
            result: { casts },
        } = await farcasterSessionHolder.fetch<{ result: { casts: Cast[] } }>(url, {
            method: 'GET',
        });

        let result = casts;
        if (casts.length > 1 && first(casts)?.castType === 'root-embed') result = casts.slice(1);

        const target = result.find((x) => x.hash === postId);
        if (!target) throw new Error(t`Unable to retrieve post details.`);
        const index = result.findIndex((x) => x.hash === postId);

        const post = formatWarpcastPost(target);

        if (index === 0) return post;
        if (index === 1) return { ...post, commentOn: result[0] ? formatWarpcastPost(result[0]) : undefined };
        if (index === 2)
            return {
                ...post,
                root: result[0] ? formatWarpcastPost(result[0]) : undefined,
                commentOn: result[1] ? formatWarpcastPost(result[1]) : undefined,
            };

        return post;
    }

    async getProfileById(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: toFid(profileId) });
        const res = await farcasterSessionHolder.fetch<UserDetailResponse>(url);
        const user = res.result.user;
        return formatWarpcastUser(user);
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes', {
            castHash: postId,
            limit: 15,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<LikesResponse>(url, { method: 'GET' });
        const data = result.likes.map((like) => formatWarpcastUser(like.reactor));
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async getRepostReactors(postId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-recasters', {
            castHash: postId,
            limit: 15,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<RecastersResponse>(url, { method: 'GET' });
        const data = result.users.map(formatWarpcastUser);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async isFollowedByMe(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: toFid(profileId) });
        const {
            result: { user },
        } = await farcasterSessionHolder.fetch<UserDetailResponse>(url);

        if (user.viewerContext?.following) return true;
        else return false;
    }

    async isFollowingMe(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: toFid(profileId) });
        const {
            result: { user },
        } = await farcasterSessionHolder.fetch<UserDetailResponse>(url);

        if (user.viewerContext?.followedBy) return true;
        else return false;
    }

    async getPostsByParentPostId(
        parentPostId: string,
        indicator?: PageIndicator,
        username?: string,
    ): Promise<Pageable<Post, PageIndicator>> {
        if (!username) throw new Error(t`Username is required.`);

        const url = urlcat(WARPCAST_CLIENT_URL, '/v2/user-thread-casts', {
            castHashPrefix: parentPostId,
            limit: 10,
            username,
        });
        const { result, next } = await farcasterSessionHolder.fetch<FeedResponse>(url, {
            method: 'GET',
        });
        const data = result.feed.map(formatWarpcastPostFromFeed);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/followers', {
            fid: toFid(profileId),
            limit: 10,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<UsersResponse>(
            url,
            {
                method: 'GET',
            },
            true,
        );
        const data = result.map(formatWarpcastUser);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/following', {
            fid: toFid(profileId),
            limit: 10,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<UsersResponse>(
            url,
            {
                method: 'GET',
            },
            true,
        );
        const data = result.map(formatWarpcastUser);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async getPostsLiked(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_CLIENT_URL, '/user-liked-casts', {
            fid: toFid(profileId),
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<CastsResponse>(
            url,
            {
                method: 'GET',
            },
            true,
        );
        const data = result.casts.map(formatWarpcastPost);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async getPostsReplies(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts', {
            fid: toFid(profileId),
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await farcasterSessionHolder.fetch<FeedResponse>(
            url,
            {
                method: 'GET',
            },
            true,
        );
        const data = result.feed.map(formatWarpcastPostFromFeed).filter((post) => post.type === 'Comment');
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async getPostsBeMentioned(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/mention-and-reply-notifications', {
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<NotificationResponse>(
            url,
            {
                method: 'GET',
            },
            true,
        );
        const data = result.notifications.map((notification) => formatWarpcastPost(notification.content.cast));
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async publishPost(post: Post): Promise<string> {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts');
        const {
            result: { cast },
        } = await farcasterSessionHolder.fetch<CastResponse>(
            url,
            {
                method: 'POST',
                body: JSON.stringify({
                    text: post.metadata.content?.content || '',
                    embeds: post.mediaObjects?.map((v) => v.url) ?? [],
                    parent: post.commentOn ? { hash: post.commentOn.postId } : undefined,
                    channelKey: post.parentChannelKey,
                }),
            },
            true,
        );

        return cast.hash;
    }

    async deletePost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts');
        await farcasterSessionHolder.fetch<CastResponse>(
            url,
            {
                method: 'DELETE',
                body: JSON.stringify({ castHash: postId }),
            },
            true,
        );

        return true;
    }

    async upvotePost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes');
        const { result: reaction } = await farcasterSessionHolder.fetch<ReactionResponse>(
            url,
            {
                method: 'PUT',
                body: JSON.stringify({ castHash: postId }),
            },
            true,
        );
        if (!reaction) throw new Error(`Something went wrong`);
    }

    async unvotePost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes');
        await farcasterSessionHolder.fetch<ReactionResponse>(
            url,
            {
                method: 'DELETE',
                body: JSON.stringify({ castHash: postId }),
            },
            true,
        );
    }

    async commentPost(postId: string, post: Post) {
        const comment = post.metadata.content?.content;
        if (!comment) throw new Error(t`Comment cannot be empty.`);

        const url = urlcat(WARPCAST_ROOT_URL, '/casts', { parent: postId });
        const response = await farcasterSessionHolder.fetch<CastResponse>(
            url,
            {
                method: 'POST',
                body: JSON.stringify({ text: comment }),
            },
            true,
        );
        return response.result.cast.hash;
    }

    async mirrorPost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        const response = await farcasterSessionHolder.fetch<{ result: { castHash: string } }>(
            url,
            {
                method: 'PUT',
                body: JSON.stringify({ castHash: postId }),
            },
            true,
        );

        return response.result.castHash;
    }

    async unmirrorPost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        await farcasterSessionHolder.fetch<SuccessResponse>(
            url,
            {
                method: 'DELETE',
                body: JSON.stringify({ castHash: postId }),
            },
            true,
        );
    }

    async followProfile(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        await farcasterSessionHolder.fetch<SuccessResponse>(
            url,
            {
                method: 'PUT',
                body: JSON.stringify({ targetFid: Number(profileId) }),
            },
            true,
        );
    }

    async follow(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        const {
            result: { success },
        } = await farcasterSessionHolder.fetch<SuccessResponse>(
            url,
            {
                method: 'PUT',
                body: JSON.stringify({ targetFid: Number(profileId) }),
            },
            true,
        );
        if (!success) throw new Error('Follow Failed');
        return true;
    }

    async unfollow(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        const {
            result: { success },
        } = await farcasterSessionHolder.fetch<SuccessResponse>(
            url,
            {
                method: 'DELETE',
                body: JSON.stringify({ targetFid: Number(profileId) }),
            },
            true,
        );

        if (!success) throw new Error('Unfollow Failed');
        return true;
    }

    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(WARPCAST_CLIENT_URL, '/search-users', {
            q,
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<SearchUsersResponse>(resolveCrossOriginURL(url), {
            method: 'GET',
        });
        const data = result.users.map(formatWarpcastUser);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(WARPCAST_CLIENT_URL, '/search-casts', {
            // the warpcast doesn't facilitate searching using hashtags
            q: encodeURIComponent(removeLeadingHash(q)),
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<SearchCastsResponse>(resolveCrossOriginURL(url), {
            method: 'GET',
        });
        const data = result.casts.map(formatWarpcastPost);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/recent-users', {
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<UsersResponse>(
            url,
            {
                method: 'GET',
            },
            true,
        );
        const data = result.map(formatWarpcastUser);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/mention-and-reply-notifications', {
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<NotificationResponse>(
            url,
            {
                method: 'GET',
            },
            true,
        );
        const data = compact(
            result.notifications.map<Notification | undefined>((notification) => {
                const notificationId = `${notification.type}_${notification.id}`;
                const post = notification.content.cast ? formatWarpcastPost(notification.content.cast) : undefined;
                const timestamp = notification.timestamp ? new Date(notification.timestamp).getTime() : undefined;
                if (notification.type === 'cast-reply') {
                    return {
                        source: Source.Farcaster,
                        notificationId,
                        type: NotificationType.Comment,
                        post,
                        timestamp,
                    };
                }
                return;
            }),
        );
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
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

    async getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
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

    async getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }
    /**
     * @param {string} postId
     * @param {'PUT' | 'DELETE'} method - PUT to bookmark, DELETE to unbookmark
     * @returns {Promise<boolean>}
     */
    async baseBookmark(postId: string, method: 'PUT' | 'DELETE'): Promise<boolean> {
        const url = urlcat(WARPCAST_CLIENT_URL, '/bookmarked-casts');
        const { result } = await farcasterSessionHolder.fetch<SuccessResponse>(resolveCrossOriginURL(url), {
            method,
            body: JSON.stringify({
                castHash: postId,
            }),
        });
        return result.success;
    }
    async bookmark(postId: string): Promise<boolean> {
        return this.baseBookmark(postId, 'PUT');
    }
    async unbookmark(postId: string): Promise<boolean> {
        return this.baseBookmark(postId, 'DELETE');
    }
    async getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(WARPCAST_CLIENT_URL, '/bookmarked-casts', {
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await farcasterSessionHolder.fetch<BookmarkedCastsResponse>(
            resolveCrossOriginURL(url),
        );
        const data = result.bookmarks.map(formatWarpcastPost);
        return createPageable(
            data,
            createIndicator(indicator),
            next?.cursor ? createNextIndicator(indicator, next.cursor) : undefined,
        );
    }
    async watch(type: WatchType, id: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async unwatch(type: WatchType, id: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}

export const WarpcastSocialMediaProvider = new WarpcastSocialMedia();
