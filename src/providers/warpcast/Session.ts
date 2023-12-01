import urlcat from 'urlcat';

import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { Type } from '@/providers/types/SocialMedia.js';

export class WarpcastSession extends BaseSession implements Session {
    constructor(profileId: string, token: string, createdAt: number, expiresAt: number, privateKey: string) {
        super(Type.Warpcast, profileId, token, createdAt, expiresAt, privateKey);
    }

    refresh(): Promise<void> {
        throw new Error('Not allowed');
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
}
