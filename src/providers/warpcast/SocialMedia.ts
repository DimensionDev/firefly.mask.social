import { t } from '@lingui/macro';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { HubRestAPIClient } from '@standard-crypto/farcaster-js';
import urlcat from 'urlcat';

import { SocialPlatform } from '@/constants/enum.js';
import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatWarpcastPostFromFeed } from '@/helpers/formatWarpcastPost.js';
import { isZero } from '@/maskbook/packages/web3-shared/base/src/index.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import {
    type Post,
    type PostType,
    type Profile,
    ProfileStatus,
    type Provider,
    ReactionType,
    Type,
} from '@/providers/types/SocialMedia.js';
import type {
    CastResponse,
    FeedResponse,
    ReactionResponse,
    SuccessResponse,
    UserResponse,
    UsersResponse,
} from '@/providers/types/Warpcast.js';
import { createSessionByGrantPermission } from '@/providers/warpcast/createSessionByGrantPermission.js';
import { WarpcastSession } from '@/providers/warpcast/Session.js';

export class WarpcastSocialMedia implements Provider {
    get type() {
        return Type.Warpcast;
    }

    async createSession(
        setUrlOrSignal?: AbortSignal | ((url: string) => void),
        signal?: AbortSignal,
    ): Promise<WarpcastSession> {
        const setUrl = typeof setUrlOrSignal === 'function' ? setUrlOrSignal : undefined;
        const abortSignal = setUrlOrSignal instanceof AbortSignal ? setUrlOrSignal : signal;

        const session = await createSessionByGrantPermission(setUrl, abortSignal);
        localStorage.setItem('warpcast_session', session.serialize());
        return session;
    }

    async resumeSession(): Promise<WarpcastSession | null> {
        const storedSession = localStorage.getItem('warpcast_session');
        if (!storedSession) return null;

        const recoveredSession = SessionFactory.createSession<WarpcastSession>(storedSession);
        if (recoveredSession.expiresAt > Date.now()) {
            return recoveredSession;
        } else {
            return null;
        }
    }

    async createClient() {
        return new HubRestAPIClient();
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(WARPCAST_ROOT_URL, '/default-recommended-feed', {
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await fetchJSON<FeedResponse>(url, {
            method: 'GET',
        });
        const data = result.feed.map(formatWarpcastPostFromFeed);
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async discoverPostsById(profileId: string, indicator?: PageIndicator | undefined) {
        const url = urlcat(WARPCAST_ROOT_URL, '/home-feed', {
            limit: 10,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const { result, next } = await this.fetchWithSession<FeedResponse>(url, {
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

        const { result, next } = await this.fetchWithSession<FeedResponse>(url, {
            method: 'GET',
        });
        const data = result.feed.map(formatWarpcastPostFromFeed);
        return createPageable(data, indicator ?? createIndicator(), createNextIndicator(indicator, next.cursor));
    }

    async getPostById(postId: string): Promise<Post> {
        throw new Error('Method not implemented.');
    }

    async getProfileById(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: profileId });
        const {
            result: { user },
        } = await this.fetchWithSession<UserResponse>(url, {
            method: 'GET',
        });

        return {
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.displayName,
            pfp: user.pfp.url,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            status: ProfileStatus.Active,
            verified: user.pfp.verified,
            viewerContext: {
                following: user.viewerContext.following,
                followedBy: user.viewerContext.followedBy,
            },
            source: SocialPlatform.Farcaster,
        };
    }

    // @ts-ignore
    async getPostsByParentPostId(
        parentPostId: string,
        username: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat('https://client.warpcast.com/v2', '/v2/user-thread-casts', {
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
        const { result, next } = await this.fetchWithSession<UsersResponse>(url, {
            method: 'GET',
        });
        const data = result.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.displayName,
            pfp: user.pfp.url,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            status: ProfileStatus.Active,
            verified: user.pfp.verified,
            viewerContext: {
                following: user.viewerContext.following,
                followedBy: user.viewerContext.followedBy,
            },
            source: SocialPlatform.Farcaster,
        }));
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/following', {
            fid: profileId,
            limit: 10,
            cursor: indicator?.id,
        });
        const { result, next } = await this.fetchWithSession<UsersResponse>(url, {
            method: 'GET',
        });
        const data = result.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.displayName,
            pfp: user.pfp.url,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            status: ProfileStatus.Active,
            verified: user.pfp.verified,
            viewerContext: {
                following: user.viewerContext.following,
                followedBy: user.viewerContext.followedBy,
            },
            source: SocialPlatform.Farcaster,
        }));
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, next.cursor));
    }

    async publishPost(post: Post): Promise<Post> {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts');
        const { result: cast } = await this.fetchWithSession<CastResponse>(url, {
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
                nickname: cast.author.username,
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
        const { result: reaction } = await this.fetchWithSession<ReactionResponse>(url, {
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
        await this.fetchWithSession<ReactionResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ castHash: postId }),
        });
    }

    async commentPost(postId: string, comment: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts', { parent: postId });
        await this.fetchWithSession<CastResponse>(url, {
            method: 'POST',
            body: JSON.stringify({ text: comment }),
        });
    }

    async mirrorPost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        await this.fetchWithSession<{ result: { castHash: string } }>(url, {
            method: 'PUT',
            body: JSON.stringify({ castHash: postId }),
        });

        return null!;
    }

    async unmirrorPost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        const { result } = await this.fetchWithSession<SuccessResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ castHash: postId }),
        });
        return result.success;
    }

    async followProfile(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        await this.fetchWithSession<SuccessResponse>(url, {
            method: 'PUT',
            body: JSON.stringify({ targetFid: Number(profileId) }),
        });
    }

    async follow(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        const {
            result: { success },
        } = await this.fetchWithSession<SuccessResponse>(url, {
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
        } = await this.fetchWithSession<SuccessResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ targetFid: Number(profileId) }),
        });

        if (!success) throw new Error('Unfollow Failed');
        return;
    }

    private async fetchWithSession<T>(url: string, options: RequestInit) {
        const session = await this.resumeSession();
        if (!session) throw new Error('No session found');
        return fetchJSON<T>(url, {
            ...options,
            headers: { Authorization: `Bearer ${session.token}` },
        });
    }

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new Error(t`Method not implemented.`);
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        throw new Error(t`Method not implemented.`);
    }
}

export const WarpcastSocialMediaProvider = new WarpcastSocialMedia();
