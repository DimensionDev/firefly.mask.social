import type { Session } from '@/providers/types/Session.js';
import { Type } from '@/providers/types/SocialMedia.js';

export abstract class BaseSession implements Session {
    constructor(
        public type: Type,
        public profileId: string,
        public token: string,
        public createdAt: number,
        public expiresAt: number,
    ) {}

    serialize(): `${Type}:${string}` {
        const body = JSON.stringify({
            profileId: `${this.profileId}`,
            token: this.token,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
        });

        return `${this.type}:${btoa(body)}`;
    }

    abstract refresh(): Promise<void>;

    abstract destroy(): Promise<void>;
}
