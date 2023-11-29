import { t } from '@lingui/macro';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import dayjs from 'dayjs';
import { compact, first } from 'lodash-es';
import urlcat from 'urlcat';

import { SocialPlatform } from '@/constants/enum.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatFarcasterPostFromFirefly } from '@/helpers/formatFarcasterPostFromFirefly.js';
import { formatFarcasterProfileFromFirefly } from '@/helpers/formatFarcasterProfileFromFirefly.js';
import { getResourceType } from '@/helpers/getResourceType.js';
import { isZero } from '@/maskbook/packages/web3-shared/base/src/index.js';
import type {
    CastResponse,
    CastsResponse,
    NotificationResponse,
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
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { hydrateCurrentAccount } from '@/store/useFarcasterStore.js';
import type { MetadataAsset } from '@/types/index.js';

// @ts-ignore
export class FireflySocialMedia implements Provider {
    get type() {
        return Type.Firefly;
    }

    async createSession(setUrlOrSignal?: AbortSignal | ((url: string) => void), signal?: AbortSignal) {
        return WarpcastSocialMediaProvider.createSession(setUrlOrSignal, signal);
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

        const asset = first(cast.embeds);
        return {
            type: (cast.parent_hash ? 'Comment' : 'Post') as PostType,
            source: SocialPlatform.Farcaster,
            postId: cast.hash,
            parentPostId: cast.parent_hash,
            timestamp: cast.timestamp ? dayjs(cast.timestamp).valueOf() : undefined,
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
                    asset: asset
                        ? ({
                              uri: asset.url,
                              type: getResourceType(asset.url),
                          } as MetadataAsset)
                        : undefined,
                },
            },
            stats: {
                comments: Number(cast.replyCount),
                mirrors: cast.recastCount,
                quotes: cast.recastCount,
                reactions: cast.likeCount,
            },
        };
    }

    async getProfileById(profileId: string) {
        const url = urlcat(FIREFLY_ROOT_URL, '/user', { fid: profileId });
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

        return createPageable(data, indicator?.id, next_cursor);
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

        return createPageable(data, indicator?.id, next_cursor);
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster', {
            fids: [profileId],
            size: 10,
            cursor: indicator?.id,
        });
        const {
            data: { casts, cursor },
        } = await fetchJSON<CastsResponse>(url, {
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
        return createPageable(data, indicator?.id, cursor);
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const currentAccount = hydrateCurrentAccount();
        if (!currentAccount.id) throw new Error('Login required');
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/notifications', {
            fid: currentAccount.id,
            sourceFid: currentAccount.id,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });
        const { data } = await fetchJSON<NotificationResponse>(url, { method: 'GET' });

        const result = data.notifications.map<Notification | undefined>((notification) => {
            const notificationId = `${currentAccount.id}_${notification.timestamp}_${notification.notificationType}`;
            const user = notification.user ? [formatFarcasterProfileFromFirefly(notification.user)] : [];
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
            indicator ?? createIndicator(),
            data.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
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

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        throw new Error(t`Method not implemented.`);
    }
}

export const FireflySocialMediaProvider = new FireflySocialMedia();
