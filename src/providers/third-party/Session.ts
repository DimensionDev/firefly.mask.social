import { signOut } from 'next-auth/react';

import { NotAllowedError } from '@/constants/error.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export class ThirdPartySession extends BaseSession implements Session {
    constructor(
        type: SessionType.Apple | SessionType.Google | SessionType.Telegram,
        profileId: string,
        token: string,
        createdAt: number,
        expiresAt: number,
    ) {
        super(type, profileId, token, createdAt, expiresAt);
    }

    override refresh(): Promise<void> {
        throw new NotAllowedError();
    }

    override async destroy(): Promise<void> {
        signOut();
    }
}
