import { BaseSession } from '@/providers/base/Session';
import { Session } from '@/providers/types/Session';
import { Type } from '@/providers/types/SocialMedia';

export class WarpcastSession extends BaseSession implements Session {
    constructor(
        public token: string,
        public timestamp: number,
        public expiresAt: number,
    ) {
        super(Type.Farcaster, token, timestamp, expiresAt);
    }
}
