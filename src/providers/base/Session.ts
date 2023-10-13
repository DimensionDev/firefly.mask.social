import { Session } from '@/providers/types/Session';
import { Type } from '@/providers/types/SocialMedia';

export class BaseSession implements Session {
    constructor(
        public type: Type,
        public token: string,
        public timestamp: number,
        public expiresAt: number,
    ) {}

    serialize(): `${Type}:${string}` {
        const body = JSON.stringify({
            token: this.token,
            createdAt: this.timestamp,
            expiresAt: this.expiresAt,
        });

        return `${this.type}:${body}`;
    }

    refresh(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    destroy(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
