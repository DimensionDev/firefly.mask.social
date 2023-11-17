import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { Type } from '@/providers/types/SocialMedia.js';

export class FireflySession extends BaseSession implements Session {
    constructor(profileId: string, token: string, createdAt: number, expiresAt: number) {
        super(Type.Firefly, profileId, token, createdAt, expiresAt);
    }

    refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    async destroy(): Promise<void> {
        // indicate the session is destroyed
        this.expiresAt = 0;

        return;
    }
}
