import urlcat from 'urlcat';

import { NotAllowedError } from '@/constants/error.js';
import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export const FAKE_SIGNER_REQUEST_TOKEN = 'fake_signer_request_token';

export class FarcasterSession extends BaseSession implements Session {
    constructor(
        /**
         * Fid
         */
        profileId: string,
        /**
         * the private key of the signer
         */
        token: string,
        createdAt: number,
        expiresAt: number,
        public signerRequestToken?: string,
        public channelToken?: string,
    ) {
        super(SessionType.Farcaster, profileId, token, createdAt, expiresAt);
    }

    override serialize(): `${SessionType}:${string}:${string}` {
        return `${super.serialize()}:${this.signerRequestToken ?? ''}:${this.channelToken ?? ''}`;
    }

    refresh(): Promise<void> {
        throw new NotAllowedError();
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

    static isGrantByPermission(
        session: Session | null,
        // if strict is true, the session must have a valid signer request token
        strict = false,
    ): session is FarcasterSession & { signerRequestToken: string } {
        if (!session) return false;
        const token = (session as FarcasterSession).signerRequestToken;
        return (
            session.type === SessionType.Farcaster &&
            !!token &&
            // strict mode
            (strict ? token !== FAKE_SIGNER_REQUEST_TOKEN : true)
        );
    }

    static isRelayService(session: Session | null): session is FarcasterSession & { channelToken: string } {
        if (!session) return false;
        return session.type === SessionType.Farcaster && !!(session as FarcasterSession).channelToken;
    }

    static isCustodyWallet(session: Session | null): session is FarcasterSession & { signerRequestToken: undefined } {
        if (!session) return false;
        return (
            session.type === SessionType.Farcaster &&
            !(session as FarcasterSession).signerRequestToken &&
            !(session as FarcasterSession).channelToken
        );
    }
}
