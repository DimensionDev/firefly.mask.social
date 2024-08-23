import { isAddress } from 'viem';

import { NotAllowedError } from '@/constants/error.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { restoreFireflySession } from '@/services/restoreFireflySession.js';

export interface FireflySessionSignature {
    address: string;
    message: string;
    signature: string;
}

export class FireflySession extends BaseSession implements Session {
    constructor(
        accountId: string,
        accessToken: string,
        public parent: Session | null,
        public signature?: FireflySessionSignature,
    ) {
        super(SessionType.Firefly, accountId, accessToken, 0, 0);
    }

    override serialize(): `${SessionType}:${string}:${string}:${string}` {
        return [
            super.serialize(),
            // parent session
            this.parent ? btoa(this.parent.serialize()) : '',
            // signature if session created by signing a message
            this.signature ? btoa(JSON.stringify(this.signature)) : '',
        ].join(':') as `${SessionType}:${string}:${string}:${string}`;
    }

    override async refresh(): Promise<void> {
        throw new NotAllowedError();
    }

    override async destroy(): Promise<void> {
        throw new NotAllowedError();
    }

    static async from(session: Session, signal?: AbortSignal): Promise<FireflySession> {
        const fireflySession = await restoreFireflySession(session, signal);
        if (!fireflySession) throw new Error(`Failed to restore firefly session for ${session.profileId}.`);
        return fireflySession;
    }

    static isCustodyWallet(session: Session | null): session is FireflySession & { signature: FireflySessionSignature } {
        if (!session) return false;
        const fireflySession = session as FireflySession;
        return (
            session.type === SessionType.Firefly &&
            fireflySession.signature !== undefined &&
            isAddress(fireflySession.signature.address)
        );
    }
}
