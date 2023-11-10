import urlcat from 'urlcat';
import { getWalletClient } from 'wagmi/actions';
import { ResponseJSON } from '@/types';
import { WARPCAST_ROOT_URL } from '@/constants';
import { fetchJSON } from '@/helpers/fetchJSON';
import { waitForSignedKeyRequestComplete } from '@/helpers/waitForSignedKeyRequestComplete';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';
import { PageIndicator, createPageable } from '@/helpers/createPageable';
import { MerkleAPIClient } from '@standard-crypto/farcaster-js';
import { Post, ProfileStatus, Provider, ReactionType, Type } from '@/providers/types/SocialMedia';
import { WarpcastSession } from '@/providers/warpcast/Session';
import {
    CastResponse,
    CastsResponse,
    ReactionResponse,
    SuccessResponse,
    UserResponse,
    UsersResponse,
} from '@/providers/types/Warpcast';

// @ts-ignore
export class WarpcastSocialMedia implements Provider {
    private currentSession: WarpcastSession | null = null;

    get type() {
        return Type.Warpcast;
    }

    /**
     * Create session by approving another FID to access the user's data.
     * @param signal
     * @returns
     */
    async createSessionBySignedKey(signal?: AbortSignal) {
        const response = await fetchJSON<
            ResponseJSON<{
                publicKey: string;
                privateKey: string;
                fid: string;
                token: string;
                timestamp: number;
                expiresAt: number;
                deeplinkUrl: string;
            }>
        >('/api/warpcast/signin', {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);

        // present QR code to the user
        console.log('DEBUG: response');
        console.log(response);

        await waitForSignedKeyRequestComplete(signal)(response.data.token);

        return new WarpcastSession(
            response.data.fid,
            response.data.privateKey,
            response.data.timestamp,
            response.data.expiresAt,
        );
    }

    /**
     * Create session by signing the challenge with the custody wallet.
     * @param signal
     * @returns
     */
    async createSessionByCustodyWallet(signal?: AbortSignal) {
        const client = await getWalletClient();
        if (!client) throw new Error('No client found');

        const { payload, token } = await generateCustodyBearer(client);
        const response = await fetchJSON<{
            result: {
                token: {
                    secret: string;
                };
            };
            errors?: Array<{ message: string; reason: string }>;
        }>(urlcat(WARPCAST_ROOT_URL, '/auth'), {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (response.errors?.length) throw new Error(response.errors[0].message);

        const { result: user } = await fetchJSON<UserResponse>(
            urlcat(WARPCAST_ROOT_URL, '/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${response.result.token.secret}`,
                    'Content-Type': 'application/json',
                },
            }),
        );

        return (this.currentSession = new WarpcastSession(
            user.fid.toString(),
            response.result.token.secret,
            payload.params.timestamp,
            payload.params.expiresAt,
        ));
    }

    async createSession(signal?: AbortSignal): Promise<WarpcastSession> {
        return this.createSessionByCustodyWallet(signal);
    }

    async resumeSession(): Promise<WarpcastSession> {
        const currentTime = Date.now();

        if (this.currentSession && this.currentSession.expiresAt > currentTime) {
            return this.currentSession;
        }

        this.currentSession = await this.createSession();
        return this.currentSession;
    }

    async createClient() {
        const session = await this.createSession();
        return new MerkleAPIClient({
            secret: session.token,
            expiresAt: session.expiresAt,
        });
    }

    async discoverPosts(indicator?: PageIndicator) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/casts', {
            fid: session.profileId,
            limit: 10,
            cursor: indicator?.cursor,
        });
        const { result, next } = await fetchJSON<CastsResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
        });
        const data = result.casts.map((cast) => {
            return {
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
                },
                metadata: {
                    locale: '',
                    content: cast.text,
                },
                stats: {
                    comments: cast.replies.count,
                    mirrors: cast.recasts.count,
                    quotes: cast.recasts.count,
                    reactions: cast.reactions.count,
                },
            };
        });
        return createPageable(data, indicator?.cursor, next.cursor);
    }

    async getPostById(postId: string) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/cast', { hash: postId });
        const { result: cast } = await fetchJSON<CastResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
        });

        return {
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
            },
            metadata: {
                locale: '',
                content: cast.text,
            },
            stats: {
                comments: cast.replies.count,
                mirrors: cast.recasts.count,
                quotes: cast.recasts.count,
                reactions: cast.reactions.count,
            },
        };
    }

    async getProfileById(profileId: string) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: profileId });
        const { result: user } = await fetchJSON<UserResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
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
        };
    }

    async getPostsByParentPostId(parentPostId: string, indicator?: PageIndicator) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/all-casts-in-thread', {
            threadHash: parentPostId,
        });
        const { result } = await fetchJSON<CastsResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
        });

        const data = result.casts.map((cast) => {
            return {
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
                },
                metadata: {
                    locale: '',
                    content: cast.text,
                },
                stats: {
                    comments: cast.replies.count,
                    mirrors: cast.recasts.count,
                    quotes: cast.recasts.count,
                    reactions: cast.reactions.count,
                },
            };
        });

        return createPageable(data, indicator?.cursor, null);
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/followers', {
            fid: profileId,
            limit: 10,
            cursor: indicator?.cursor,
        });
        const { result, next } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
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
        }));

        return createPageable(data, indicator?.cursor, next.cursor);
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/following', {
            fid: profileId,
            limit: 10,
            cursor: indicator?.cursor,
        });
        const { result, next } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
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
        }));

        return createPageable(data, indicator?.cursor, next.cursor);
    }

    async publishPost(post: Post) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/casts');
        const { result: cast } = await fetchJSON<CastResponse>(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: post.metadata.content }),
        });

        return {
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
            },
            metadata: {
                locale: '',
                content: cast.text,
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
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes');
        const { result: reaction } = await fetchJSON<ReactionResponse>(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ castHash: postId }),
        });

        return {
            reactionId: reaction.hash,
            type: ReactionType.Upvote,
            timestamp: reaction.timestamp,
        };
    }

    async unvotePost(postId: string) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes');
        await fetchJSON<ReactionResponse>(url, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ castHash: postId }),
        });
    }

    async commentPost(postId: string, comment: string) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/casts', { parent: postId });
        await fetchJSON<CastResponse>(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: comment }),
        });
    }

    async mirrorPost(postId: string) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        await fetchJSON<{ result: { castHash: string } }>(url, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ castHash: postId }),
        });

        return null!;
    }

    async unmirrorPost(postId: string) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        const { result } = await fetchJSON<SuccessResponse>(url, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ castHash: postId }),
        });
        return result.success;
    }

    async followProfile(profileId: string) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        await fetchJSON<SuccessResponse>(url, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetFid: Number(profileId) }),
        });
    }

    async unfollow(profileId: string) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        await fetchJSON<SuccessResponse>(url, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetFid: Number(profileId) }),
        });
    }
}
