import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';

import { NotAllowedError } from '@/constants/error.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export class LensSession extends BaseSession implements Session {
    constructor(
        profileId: string,
        token: string,
        createdAt: number,
        expiresAt: number,
        public refreshToken?: string,
        public address?: string,
    ) {
        super(SessionType.Lens, profileId, token, createdAt, expiresAt);
    }

    override serialize(): `${SessionType}:${string}:${string}` {
        return `${super.serialize()}:${this.refreshToken ?? ''}:${this.address ?? ZERO_ADDRESS}`;
    }

    refresh(): Promise<void> {
        throw new NotAllowedError();
    }

    async destroy(): Promise<void> {
        throw new NotAllowedError();
    }
}
