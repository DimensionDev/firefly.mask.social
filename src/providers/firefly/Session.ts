import { BaseSession } from '@/providers/base/Session';
import { Session } from '@/providers/types/Session';
import { Type } from '@/providers/types/SocialMedia';

export class FireflySession extends BaseSession implements Session {
    constructor(
        public profileId: string,
        public token: string,
        public timestamp: number,
        public expiresAt: number,
    ) {
        super(Type.Firefly, profileId, token, timestamp, expiresAt);
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
