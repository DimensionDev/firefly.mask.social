import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export class FireflySession extends BaseSession implements Session {
    constructor(accountId: string, accessToken: string) {
        super(SessionType.Firefly, accountId, accessToken, 0, 0);
    }

    override async refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    override async destroy(): Promise<void> {
        throw new Error('Not allowed');
    }
}
