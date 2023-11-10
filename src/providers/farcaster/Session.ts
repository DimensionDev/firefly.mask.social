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

    refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    destroy(): Promise<void> {
        throw new Error('Not allowed');
    }
}
