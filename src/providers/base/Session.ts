import type { Session } from '@/providers/types/Session.js';
import { Type } from '@/providers/types/SocialMedia.js';

export abstract class BaseSession implements Session {
    constructor(
        public type: Type,
        public profileId: string | number,
        public token: string,
        public createdAt: number,
        public expiresAt: number,
        // for warpcast
        public privateKey?: string,
    ) {}

    serialize(): `${Type}:${string}` {
        const body = JSON.stringify({
            profileId: `${this.profileId}`,
            token: this.token,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
            privateKey: this.privateKey,
        });

        return `${this.type}:${body}`;
    }

    abstract refresh(): Promise<void>;

    abstract destroy(): Promise<void>;
}
