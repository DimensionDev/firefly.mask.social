import { lensClient } from '@/configs/lensClient.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { type Profile, Type } from '@/providers/types/SocialMedia.js';

export class LensSession extends BaseSession implements Session {
    constructor(
        profileId: string,
        token: string,
        createdAt: number,
        expiresAt: number,
        public profile: Profile,
        public client = lensClient,
    ) {
        super(Type.Lens, profileId, token, createdAt, expiresAt);
    }

    refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    override serialize(): `${Type}:${string}` {
        const body = JSON.stringify({
            profileId: this.profileId,
            token: this.token,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
            profile: this.profile,
            client: this.client,
            type: this.type,
        });

        return `${this.type}:${body}`;
    }

    async destroy(): Promise<void> {
        await this.client.authentication.logout();

        this.expiresAt = 0;
    }
}
