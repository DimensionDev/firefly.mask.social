import { NotAllowedError } from '@/constants/error.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

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
        public signature: FireflySessionSignature | null,
        // indicate a new firefly binding when it was created
        public isNew?: boolean,
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
            // isNew flag
            this.isNew ? '1' : '0',
        ].join(':') as `${SessionType}:${string}:${string}:${string}`;
    }

    override async refresh(): Promise<void> {
        throw new NotAllowedError();
    }

    override async destroy(): Promise<void> {
        throw new NotAllowedError();
    }
}
