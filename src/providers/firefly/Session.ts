import { BaseSession } from '@/providers/base/Session';
import { Session } from '@/providers/types/Session';
import { Type } from '@/providers/types/SocialMedia';

export class FireflySession extends BaseSession implements Session {
    constructor(
        public profileId: string,
        public token: string,
        public timestamp: number,
        public expiresAt: number,
    ) {
        super(Type.Firefly, profileId, token, timestamp, expiresAt);
    }

    serialize(): `${Type}:${string}` {
        const body = JSON.stringify({
            profileId: this.profileId,
            token: this.token,
            timestamp: this.timestamp,
            expiresAt: this.expiresAt,
        });

        return `${super.type}:${body}`;
    }

    static deserialize(serializedSession: string): FireflySession {
        const colonIndex = serializedSession.indexOf(':');
        const body = serializedSession.substring(colonIndex + 1);
        const data = JSON.parse(body);

        const session = new FireflySession(data.profileId, data.token, data.timestamp, data.expiresAt);

        return session;
    }

    refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    async destroy(): Promise<void> {
        // indicate the session is destroyed
        this.expiresAt = 0;

        return;
    }
}
