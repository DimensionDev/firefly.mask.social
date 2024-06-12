import { Source } from '@/constants/enum.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { restoreProfile } from '@/helpers/restoreProfile.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { restoreFireflySession } from '@/services/restoreFireflySession.js';

export class FireflySession extends BaseSession implements Session {
    constructor(
        accountId: string,
        accessToken: string,
        public parent: Session | null,
    ) {
        super(SessionType.Firefly, accountId, accessToken, 0, 0);
    }

    override serialize(): `${SessionType}:${string}:${string}` {
        return `${super.serialize()}:${this.parent ? btoa(this.parent.serialize()) : ''}`;
    }

    override async refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    override async destroy(): Promise<void> {
        throw new Error('Not allowed');
    }

    static async from(session: Session, signal?: AbortSignal): Promise<FireflySession> {
        const fireflySession = await restoreFireflySession(session, signal);
        if (!fireflySession) throw new Error(`Failed to restore firefly session for ${session.profileId}.`);
        return fireflySession;
    }

    static async restore(session: FireflySession) {
        const profile = createDummyProfile(Source.Farcaster);
        restoreProfile(profile, [profile], session);
        return session;
    }

    static async fromAndRestore(session: Session, signal?: AbortSignal): Promise<FireflySession | null> {
        const fireflySession = await FireflySession.from(session, signal);

        // polling failed
        if (!session.profileId)
            throw new Error(
                'Failed to query the signed key request status after several attempts. Please try again later.',
            );

        return FireflySession.restore(fireflySession);
    }
}
