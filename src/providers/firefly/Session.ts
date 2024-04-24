import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { BaseSession } from '@/providers/base/Session.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { FarcasterLoginResponse, LensLoginResponse } from '@/providers/types/Firefly.js';
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

    static async from(session: Session): Promise<FireflySession> {
        switch (session.type) {
            case SessionType.Lens: {
                const url = urlcat(FIREFLY_ROOT_URL, '/v3/auth/lens/login');
                const { data } = await fetchJSON<LensLoginResponse>(url, {
                    method: 'POST',
                    body: JSON.stringify({
                        accessToken: session.token,
                    }),
                });
                return new FireflySession(data.accountId, data.accessToken);
            }
            case SessionType.Farcaster: {
                if (!FarcasterSession.isGrantByPermission(session)) throw new Error('Not allowed');
                const url = urlcat(FIREFLY_ROOT_URL, '/v3/auth/farcaster/login');
                const { data } = await fetchJSON<FarcasterLoginResponse>(url, {
                    method: 'POST',
                    body: JSON.stringify({
                        channelToken: session.signerRequestToken,
                    }),
                });
                return new FireflySession(data.accountId, data.accessToken);
            }
            case SessionType.Firefly:
                throw new Error('Not allowed');
            case SessionType.Twitter:
                throw new Error('Not allowed');
            default:
                safeUnreachable(session.type);
                throw new Error(`Unknown session type: ${session.type}`);
        }
    }
}
