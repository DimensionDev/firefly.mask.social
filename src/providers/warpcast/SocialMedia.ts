import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { isZero } from '@masknet/web3-shared-base';
import { HubRestAPIClient } from '@standard-crypto/farcaster-js';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { warpcastClient } from '@/configs/warpcastClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST, WARPCAST_CLIENT_URL, WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatWarpcastPost, formatWarpcastPostFromFeed } from '@/helpers/formatWarpcastPost.js';
import { formatWarpcastUser } from '@/helpers/formatWarpcastUser.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import {
    type Notification,
    NotificationType,
    type Post,
    type PostType,
    type Profile,
    ProfileStatus,
    type Provider,
    ReactionType,
    Type,
} from '@/providers/types/SocialMedia.js';
import {
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
import { createSessionByCustodyWallet } from '@/providers/warpcast/createSessionByCustodyWallet.js';
import { createSessionByGrantPermission } from '@/providers/warpcast/createSessionByGrantPermission.js';
import { WarpcastSession } from '@/providers/warpcast/Session.js';

export class WarpcastSocialMedia implements Provider {
    get type() {
        return Type.Warpcast;
    }

    async createSession(signal?: AbortSignal): Promise<WarpcastSession> {
        throw new Error('Please use createSessionWithURL() instead.');
    }

    async createSessionByCustodyWallet(signal?: AbortSignal) {
        const client = await getWalletClientRequired();
        return createSessionByCustodyWallet(client, signal);
    }

    async createSessionByGrantPermission(
        setUrl: (url: string) => void,
        signal?: AbortSignal,
    ): Promise<WarpcastSession> {
        return createSessionByGrantPermission(setUrl, signal);
    }

    async createClient() {
        return new HubRestAPIClient();
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/popular-casts-feed', {
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await fetchJSON<CastsResponse>(url, {
            method: 'GET',
        });
        const data = result.casts.map(formatWarpcastPost);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async discoverPostsById(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/home-feed', {
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await warpcastClient.fetchWithSession<FeedResponse>(url, {
            method: 'GET',
        });
        const data = result.feed.map(formatWarpcastPostFromFeed);
        return createPageable(data, indicator ?? createIndicator(), createNextIndicator(indicator, next.cursor));
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts', {
            fid: profileId,
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await warpcastClient.fetchWithSession<CastsResponse>(url, {
            method: 'GET',
        });
        const data = result.casts.map(formatWarpcastPost);
        return createPageable(data, indicator ?? createIndicator(), createNextIndicator(indicator, next.cursor));
    }

    async getPostById(postId: string): Promise<Post> {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast', { hash: postId });
        const {
            result: { cast },
        } = await warpcastClient.fetchWithSession<{ result: { cast: Cast } }>(url, {
            method: 'GET',
        });
        return formatWarpcastPost(cast);
    }

    async getProfileById(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: profileId });
        const {
            result: { user },
        } = await warpcastClient.fetchWithSession<UserDetailResponse>(url, {
            method: 'GET',
        });

        return formatWarpcastUser(user);
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes', {
            castHash: postId,
            limit: 15,
            cursor: indicator?.id,
        });
        const { result, next } = await warpcastClient.fetchWithSession<LikesResponse>(url, { method: 'GET' });
        const data = result.likes.map((like) => formatWarpcastUser(like.reactor));
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async getMirrorReactors(postId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-recasters', {
            castHash: postId,
            limit: 15,
            cursor: indicator?.id,
        });
        const { result, next } = await warpcastClient.fetchWithSession<RecastersResponse>(url, { method: 'GET' });
        const data = result.users.map(formatWarpcastUser);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async isFollowedByMe(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: profileId });
        const {
            result: { user },
        } = await warpcastClient.fetchWithSession<UserDetailResponse>(url, {
            method: 'GET',
        });

        if (user.viewerContext?.following) return true;
        else return false;
    }

    async isFollowingMe(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: profileId });
        const {
            result: { user },
        } = await warpcastClient.fetchWithSession<UserDetailResponse>(url, {
            method: 'GET',
        });

        if (user.viewerContext?.followedBy) return true;
        else return false;
    }

    // @ts-ignore
    async getPostsByParentPostId(
        parentPostId: string,
        username: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(WARPCAST_CLIENT_URL, '/v2/user-thread-casts', {
            castHashPrefix: parentPostId,
            limit: 10,
            username,
        });
        const { result, next } = await fetchJSON<FeedResponse>(url, {
            method: 'GET',
        });
        const data = result.feed.map(formatWarpcastPostFromFeed);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/followers', {
            fid: profileId,
            limit: 10,
            cursor: indicator?.id,
        });
        const { result, next } = await warpcastClient.fetchWithSession<UsersResponse>(url, {
            method: 'GET',
        });
        const data = result.map(formatWarpcastUser);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/following', {
            fid: profileId,
            limit: 10,
            cursor: indicator?.id,
        });
        const { result, next } = await warpcastClient.fetchWithSession<UsersResponse>(url, {
            method: 'GET',
        });
        const data = result.map(formatWarpcastUser);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async getPostsLiked(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_CLIENT_URL, '/user-liked-casts', {
            fid: profileId,
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await warpcastClient.fetchWithSession<CastsResponse>(url, {
            method: 'GET',
        });
        const data = result.casts.map(formatWarpcastPost);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async getPostsReplies(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts', {
            fid: profileId,
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await warpcastClient.fetchWithSession<FeedResponse>(url, {
            method: 'GET',
        });
        const data = result.feed.map(formatWarpcastPostFromFeed).filter((post) => post.type === 'Comment');
        return createPageable(data, indicator ?? createIndicator(), createNextIndicator(indicator, next.cursor));
    }

    async getPostsBeMentioned(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/mention-and-reply-notifications', {
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await warpcastClient.fetchWithSession<NotificationResponse>(url, {
            method: 'GET',
        });
        const data = result.notifications.map((notification) => formatWarpcastPost(notification.content.cast));
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async publishPost(post: Post): Promise<Post> {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts');
        const { result: cast } = await warpcastClient.fetchWithSession<CastResponse>(url, {
            method: 'POST',
            body: JSON.stringify({ text: post.metadata.content }),
        });

        return {
            type: 'Post' as PostType,
            source: SocialPlatform.Farcaster,
            postId: cast.hash,
            parentPostId: cast.threadHash,
            timestamp: cast.timestamp,
            author: {
                profileId: cast.author.fid.toString(),
                handle: cast.author.username,
                displayName: cast.author.displayName,
                pfp: cast.author.pfp.url,
                followerCount: cast.author.followerCount,
                followingCount: cast.author.followingCount,
                status: ProfileStatus.Active,
                verified: cast.author.pfp.verified,
                source: SocialPlatform.Farcaster,
            },
            metadata: {
                locale: '',
                content: {
                    content: cast.text,
                },
            },
            stats: {
                comments: cast.replies.count,
                mirrors: cast.recasts.count,
                quotes: cast.recasts.count,
                reactions: cast.reactions.count,
            },
        };
    }

    async upvotePost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes');
        const { result: reaction } = await warpcastClient.fetchWithSession<ReactionResponse>(url, {
            method: 'POST',
            body: JSON.stringify({ castHash: postId }),
        });

        return {
            reactionId: reaction.hash,
            type: ReactionType.Upvote,
            timestamp: reaction.timestamp,
        };
    }

    async unvotePost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes');
        await warpcastClient.fetchWithSession<ReactionResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ castHash: postId }),
        });
    }

    async commentPost(postId: string, comment: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts', { parent: postId });
        await warpcastClient.fetchWithSession<CastResponse>(url, {
            method: 'POST',
            body: JSON.stringify({ text: comment }),
        });
    }

    async mirrorPost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        await warpcastClient.fetchWithSession<{ result: { castHash: string } }>(url, {
            method: 'PUT',
            body: JSON.stringify({ castHash: postId }),
        });

        return null!;
    }

    async unmirrorPost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        const { result } = await warpcastClient.fetchWithSession<SuccessResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ castHash: postId }),
        });
        return result.success;
    }

    async followProfile(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        await warpcastClient.fetchWithSession<SuccessResponse>(url, {
            method: 'PUT',
            body: JSON.stringify({ targetFid: Number(profileId) }),
        });
    }

    async follow(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        const {
            result: { success },
        } = await warpcastClient.fetchWithSession<SuccessResponse>(url, {
            method: 'PUT',
            body: JSON.stringify({ targetFid: Number(profileId) }),
        });
        if (!success) throw new Error('Follow Failed');
        return;
    }

    async unfollow(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        const {
            result: { success },
        } = await warpcastClient.fetchWithSession<SuccessResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ targetFid: Number(profileId) }),
        });

        if (!success) throw new Error('Unfollow Failed');
        return;
    }

    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(WARPCAST_CLIENT_URL, '/search-users', {
            q,
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await fetchJSON<SearchUsersResponse>(url, {
            method: 'GET',
        });
        const data = result.users.map(formatWarpcastUser);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next?.cursor));
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(WARPCAST_CLIENT_URL, '/search-casts', {
            q,
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await fetchJSON<SearchCastsResponse>(url, {
            method: 'GET',
        });
        const data = result.casts.map(formatWarpcastPost);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next?.cursor));
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/recent-users', {
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await warpcastClient.fetchWithSession<UsersResponse>(url, {
            method: 'GET',
        });
        const data = result.map(formatWarpcastUser);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next?.cursor));
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/mention-and-reply-notifications', {
            limit: 25,
            cursor: indicator?.id,
        });
        const { result, next } = await warpcastClient.fetchWithSession<NotificationResponse>(url, {
            method: 'GET',
        });
        const data = result.notifications.map<Notification | undefined>((notification) => {
            const notificationId = `${notification.type}_${notification.id}`;
            const user = notification.actor ? [formatWarpcastUser(notification.actor)] : EMPTY_LIST;
            const post = notification.content.cast ? formatWarpcastPost(notification.content.cast) : undefined;
            const timestamp = notification.timestamp ? new Date(notification.timestamp).getTime() : undefined;
            if (notification.type === 'cast-reply') {
                return {
                    source: SocialPlatform.Farcaster,
                    notificationId,
                    type: NotificationType.Comment,
                    post,
                    timestamp,
                };
            }
            return;
        });
        return createPageable(compact(data), createIndicator(indicator), createNextIndicator(indicator, next?.cursor));
    }
}

export const WarpcastSocialMediaProvider = new WarpcastSocialMedia();
