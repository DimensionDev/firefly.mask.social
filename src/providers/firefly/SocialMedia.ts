import { t } from '@lingui/macro';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { SocialPlatform } from '@/constants/enum.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatFarcasterPostFromFirefly } from '@/helpers/formatFarcasterPostFromFirefly.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { isZero } from '@/maskbook/packages/web3-shared/base/src/index.js';
import type {
    CastResponse,
    CastsResponse,
    CommentsResponse,
    NotificationResponse,
    SearchCastsResponse,
    UserResponse,
    UsersResponse,
} from '@/providers/types/Firefly.js';
import {
    type Notification,
    NotificationType,
    type Post,
    type PostType,
    type Profile,
    ProfileStatus,
    type Provider,
    type Reaction,
    Type,
} from '@/providers/types/SocialMedia.js';
import type { WarpcastSession } from '@/providers/warpcast/Session.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { hydrateCurrentProfile } from '@/store/useFarcasterStore.js';

// @ts-ignore
export class FireflySocialMedia implements Provider {
    get type() {
        return Type.Firefly;
    }

    async createSession(signal?: AbortSignal): Promise<WarpcastSession> {
        throw new Error('Please use createSessionByGrantPermission() instead.');
    }

    async createSessionByCustodyWallet(signal?: AbortSignal) {
        return WarpcastSocialMediaProvider.createSessionByGustodyWallet(signal);
    }

    async createSessionByGrantPermission(setUrl: (url: string) => void, signal?: AbortSignal) {
        return WarpcastSocialMediaProvider.createSessionByGrantPermission(setUrl, signal);
    }

    async resumeSession() {
        return WarpcastSocialMediaProvider.resumeSession();
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostById(postId: string): Promise<Post> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast', { hash: postId });
        const { data: cast } = await fetchJSON<CastResponse>(url, {
            method: 'GET',
        });

        return formatFarcasterPostFromFirefly(cast);
    }

    async getProfileById(profileId: string) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/profile', { fid: profileId });
        const { data: user } = await fetchJSON<UserResponse>(url, {
            method: 'GET',
        });

        return {
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
            source: SocialPlatform.Farcaster,
        };
    }

    async getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
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
        const data = list.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
            source: SocialPlatform.Farcaster,
        }));

        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next_cursor));
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
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
        const data = list.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
            source: SocialPlatform.Farcaster,
        }));

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
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster', {
            fids: [profileId],
            size: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });
        const {
            data: { casts, cursor },
        } = await fetchJSON<CastsResponse>(url, {
            method: 'GET',
        });
        const data = casts.map((cast) => ({
            type: (cast.parent_hash ? t`Comment` : t`Post`) as PostType,
            source: SocialPlatform.Farcaster,
            postId: cast.hash,
            parentPostId: cast.parent_hash,
            timestamp: Number(cast.created_at),
            author: {
                profileId: cast.author.fid,
                nickname: cast.author.username,
                displayName: cast.author.display_name,
                pfp: cast.author.pfp,
                followerCount: cast.author.followers,
                followingCount: cast.author.following,
                status: ProfileStatus.Active,
                verified: true,
                source: SocialPlatform.Farcaster,
            },
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
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, cursor));
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const currentProfile = hydrateCurrentProfile();
        if (!currentProfile?.profileId) throw new Error(t`Login required`);
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/notifications', {
            fid: currentProfile.profileId,
            sourceFid: currentProfile.profileId,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });
        const { data } = await fetchJSON<NotificationResponse>(url, { method: 'GET' });

        const result = data.notifications.map<Notification | undefined>((notification) => {
            const notificationId = `${currentProfile.profileId}_${notification.timestamp}_${notification.notificationType}`;
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
                return {
                    source: SocialPlatform.Farcaster,
                    notificationId,
                    type: NotificationType.Comment,
                    comment: post,
                    post: notification.cast?.parentCast
                        ? formatFarcasterPostFromFirefly(notification.cast.parentCast)
                        : undefined,
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
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/timeline/farcaster');

        const {
            data: { casts, cursor },
        } = await fetchJSON<CastsResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                fid: profileId,
                sourceFid: profileId,
                cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
            }),
        });

        const data = casts.map((cast) => ({
            type: (cast.parent_hash ? 'Comment' : 'Post') as PostType,
            source: SocialPlatform.Farcaster,
            postId: cast.hash,
            parentPostId: cast.parent_hash,
            timestamp: Number(cast.created_at),
            author: {
                profileId: cast.author.fid,
                nickname: cast.author.username,
                displayName: cast.author.display_name,
                pfp: cast.author.pfp,
                followerCount: cast.author.followers,
                followingCount: cast.author.following,
                status: ProfileStatus.Active,
                verified: true,
                source: SocialPlatform.Farcaster,
            },
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
        return createPageable(
            data,
            indicator ?? createIndicator(),
            cursor ? createNextIndicator(indicator, cursor) : undefined,
        );
    }

    async publishPost(post: Post): Promise<Post> {
        throw new Error('Method not implemented.');
    }

    async upvotePost(postId: string): Promise<Reaction> {
        throw new Error('Method not implemented.');
    }

    async unvotePost(postId: string) {
        throw new Error('Method not implemented.');
    }

    async commentPost(postId: string, comment: string) {
        throw new Error('Method not implemented.');
    }

    async mirrorPost(postId: string): Promise<Post> {
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

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new Error(t`Method not implemented.`);
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
            author: {
                profileId: cast.author.fid,
                nickname: cast.author.username,
                displayName: cast.author.display_name,
                pfp: cast.author.pfp,
                followerCount: cast.author.followers,
                followingCount: cast.author.following,
                status: ProfileStatus.Active,
                verified: true,
                source: SocialPlatform.Farcaster,
            },
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
}

export const FireflySocialMediaProvider = new FireflySocialMedia();
