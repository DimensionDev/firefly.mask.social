import urlcat from 'urlcat';
import { getWalletClient } from 'wagmi/actions';
import { MerkleAPIClient } from '@standard-crypto/farcaster-js';
import { fetchJSON } from '@/helpers/fetchJSON';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';
import { WARPCAST_ROOT_URL } from '@/constants';
import { Provider, Type } from '@/providers/types/SocialMedia';
import { Session } from '@/providers/types/Session';
import { FarcasterSession } from '@/providers/farcaster/Session';
import { PageIndicator, createPageable } from '@/helpers/createPageable';
import { CastsResponse } from '@/providers/types/Farcaster';

export class FarcasterSocialMedia implements Provider {
    get type() {
        return Type.Farcaster;
    }

    async createSession(): Promise<Session> {
        const client = await getWalletClient();
        if (!client) throw new Error('No client found');

        const { payload, token } = await generateCustodyBearer(client);
        const response = await fetchJSON<{
            result: {
                // TODO: this filed was added for demonstration purposes only
                // TODO: should update this type according to the actual response
                fid: string;
                token: {
                    expiresAt: number;
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

        return new FarcasterSession(
            response.result.fid,
            response.result.token.secret,
            payload.params.timestamp,
            payload.params.expiresAt,
        );
    }

    async resumeSession(): Promise<Session> {
        // TODO: impl the resume session logic
        return this.createSession();
    }

    async createClient() {
        const session = await this.createSession();
        return new MerkleAPIClient({
            secret: session.token,
            expiresAt: session.expiresAt,
        });
    }

    async getRecentPosts(indicator?: PageIndicator) {
        const session = await this.resumeSession();

        const url = urlcat(WARPCAST_ROOT_URL, '/casts', {
            fid: session.profileId,
            limit: 10,
            cursor: indicator?.cursor,
        });
        const { result, next } = await fetchJSON<CastsResponse>(url, {
            method: 'GET',
            headers: { Authorization: `Bearer `, 'Content-Type': 'application/json' },
        });
        const data = result.casts.map((cast) => {
            return {
                postId: cast.hash,
                parentPostId: cast.threadHash,
                timestamp: cast.timestamp,
                author: {
                    userId: cast.author.fid.toString(),
                    nickname: cast.author.username,
                    displayName: cast.author.displayName,
                    pfp: cast.author.pfp.url,
                    followerCount: cast.author.followerCount,
                    followingCount: cast.author.followingCount,
                    status: 'active',
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
}
