import urlcat from 'urlcat';
import { WARPCAST_ROOT_URL } from '@/constants';
import { fetchJSON } from '@/helpers/fetchJSON';
import { Session } from '@/providers/types/Session';
import { BaseSession } from '@/providers/base/Session';
import { Type } from '@/providers/types/SocialMedia';

export class FarcasterSession extends BaseSession implements Session {
    constructor(
        public profileId: string,
        public token: string,
        public timestamp: number,
        public expiresAt: number,
    ) {
        super(Type.Farcaster, profileId, token, timestamp, expiresAt);
    }

    async destroy(): Promise<void> {
        const response = await fetchJSON<{
            result: {
                success: boolean;
            };
        }>(urlcat(WARPCAST_ROOT_URL, '/auth'), {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                method: 'revokeToken',
                params: {
                    timestamp: this.timestamp,
                },
            }),
        });

        // indicate the session is destroyed
        this.expiresAt = 0;

        if (!response.result.success) throw new Error('Failed to destroy the session.');
        return;
    }
}
