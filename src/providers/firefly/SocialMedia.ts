import urlcat from 'urlcat';
import { getWalletClient } from 'wagmi/actions';
import { ResponseJSON } from '@/types';
import { FIREFLY_ROOT_URL, WARPCAST_ROOT_URL } from '@/constants';
import { fetchJSON } from '@/helpers/fetchJSON';
import { waitForSignedKeyRequestComplete } from '@/helpers/waitForSignedKeyRequestComplete';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';
import { PageIndicator, createPageable } from '@/helpers/createPageable';
import { MerkleAPIClient } from '@standard-crypto/farcaster-js';
import { ProfileStatus, Provider, Type } from '@/providers/types/SocialMedia';
import { CastResponse, UsersResponse, UserResponse, CastsResponse } from '@/providers/types/Firefly';
import { FireflySession } from './Session';
import { CastsResponse as DiscoverPosts } from '@/providers/types/Warpcast';

// @ts-ignore
export class FireflySocialMedia implements Provider {
    private currentSession: FireflySession | null = null;

    get type() {
        return Type.Firefly;
    }

    /**
     * Initiates the creation of a session by granting data access permission to another FID.
     * @param signal
     * @returns
     */
    async createSessionByGrantPermission(signal?: AbortSignal) {
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

        return new FireflySession(
            response.data.fid,
            response.data.privateKey,
            response.data.timestamp,
            response.data.expiresAt,
        );
    }

    /**
     * Create a session by signing the challenge with the custody wallet
     * @param signal
     * @returns
     */
    async createSessionByCustodyWallet(signal?: AbortSignal) {
        const client = await getWalletClient();
        if (!client) throw new Error('No client found');

        const { payload, token } = await generateCustodyBearer(client);

        return (this.currentSession = new FireflySession('1', '', payload.params.timestamp, payload.params.expiresAt));
    }

    async createSession(signal?: AbortSignal): Promise<FireflySession> {
        // Use the custody wallet by default
        return this.createSessionByCustodyWallet(signal);
    }

    async resumeSession(): Promise<FireflySession> {
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
        const url = urlcat('https://client.warpcast.com/v2', '/popular-casts-feed', {
            limit: 10,
            cursor: indicator?.cursor,
        });

        const { result, next } = await fetchJSON<DiscoverPosts>(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
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

        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast', { hash: postId, fid: session.profileId });
        const { data: cast } = await fetchJSON<CastResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
        });

        return {
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
            },
            metadata: {
                locale: '',
                content: cast.text,
            },
            stats: {
                comments: cast.replyCount,
                mirrors: cast.recastCount,
                quotes: cast.recastCount,
                reactions: cast.likeCount,
            },
        };
    }

    async getProfileById(profileId: string) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: profileId });
        const { data: user } = await fetchJSON<UserResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
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
        };
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
        const session = await this.resumeSession();

        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followers', {
            fid: profileId,
            size: 10,
            cursor: indicator?.cursor,
            sourceFid: session.profileId,
        });
        const {
            data: { list, next_cursor },
        } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
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
        }));

        return createPageable(data, indicator?.cursor, next_cursor);
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const session = await this.resumeSession();

        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followings', {
            fid: profileId,
            size: 10,
            cursor: indicator?.cursor,
            sourceFid: session.profileId,
        });
        const {
            data: { list, next_cursor },
        } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
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
        }));

        return createPageable(data, indicator?.cursor, next_cursor);
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        const session = await this.resumeSession();

        const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster', {
            fids: [profileId],
            size: 10,
            cursor: indicator?.cursor,
            sourceFid: session.profileId,
        });
        const {
            data: { casts, cursor },
        } = await fetchJSON<CastsResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
        });
        const data = casts.map((cast) => ({
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
            },
            metadata: {
                locale: '',
                content: cast.text,
            },
            stats: {
                comments: cast.replyCount,
                mirrors: cast.recastCount,
                quotes: cast.recastCount,
                reactions: cast.likeCount,
            },
        }));
        return createPageable(data, indicator?.cursor, cursor);
    }
}
