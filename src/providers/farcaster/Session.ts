import urlcat from 'urlcat';

import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { signWithED25519 } from '@/helpers/signWithED25519.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export class FarcasterSession extends BaseSession implements Session {
    constructor(
        profileId: string,
        token: string,
        createdAt: number,
        expiresAt: number,
        public signerRequestToken?: string,
    ) {
        super(SessionType.Farcaster, profileId, token, createdAt, expiresAt);
    }

    override serialize(): `${SessionType}:${string}:${string}` {
        return `${super.serialize()}:${this.signerRequestToken ?? ''}`;
    }

    sign(message: string) {
        if (FarcasterSession.isCustodyWallet(this)) throw new Error('Sign with custody wallet is not allowed');
        if (FarcasterSession.isGrantByPermission(this)) return signWithED25519(message, this.token);

        throw new Error('Invalid session type');
    }

    refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    async destroy(): Promise<void> {
        const url = urlcat(WARPCAST_ROOT_URL, '/auth');
        const response = await fetchJSON<{
            result: {
                success: boolean;
            };
        }>(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify({
                method: 'revokeToken',
                params: {
                    timestamp: this.createdAt,
                },
            }),
        });

        // indicate the session is destroyed
        this.expiresAt = 0;

        if (!response.result.success) throw new Error('Failed to destroy the session.');
        return;
    }

    static isGrantByPermission(session: Session | null): session is FarcasterSession & { signerRequestToken: string } {
        if (!session) return false;
        return session.type === SessionType.Farcaster && !!(session as FarcasterSession).signerRequestToken;
    }

    static isCustodyWallet(session: Session | null): session is FarcasterSession & { signerRequestToken: undefined } {
        if (!session) return false;
        return session.type === SessionType.Farcaster && !(session as FarcasterSession).signerRequestToken;
    }
}
