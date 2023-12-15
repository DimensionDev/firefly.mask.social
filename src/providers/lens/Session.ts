import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export class LensSession extends BaseSession implements Session {
    constructor(profileId: string, token: string, createdAt: number, expiresAt: number) {
        super(SessionType.Lens, profileId, token, createdAt, expiresAt);
    }

    refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    override serialize(): `${SessionType}:${string}` {
        const body = JSON.stringify({
            type: this.type,
            token: this.token,
            profileId: this.profileId,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
        });

        return `${this.type}:${body}`;
    }

    async destroy(): Promise<void> {
        throw new Error('Not allowed');
    }
}
