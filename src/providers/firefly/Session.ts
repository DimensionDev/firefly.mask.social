import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
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

    static async from(session: Session, signal?: AbortSignal): Promise<FireflySession | null> {
        switch (session.type) {
            case SessionType.Lens: {
                const url = urlcat(FIREFLY_ROOT_URL, '/v3/auth/lens/login');
                const response = await fetchJSON<LensLoginResponse>(url, {
                    method: 'POST',
                    body: JSON.stringify({
                        accessToken: session.token,
                    }),
                    signal,
                });
                const data = resolveFireflyResponseData(response);
                return new FireflySession(data.accountId, data.accessToken);
            }
            case SessionType.Farcaster: {
                if (FarcasterSession.isCustodyWallet(session)) throw new Error('Not allowed');

                const isGrantByPermission = FarcasterSession.isGrantByPermission(session);
                const isRelayService = FarcasterSession.isRelayService(session);

                const url = urlcat(FIREFLY_ROOT_URL, '/v3/auth/farcaster/login');
                const response = await fetchJSON<FarcasterLoginResponse>(url, {
                    method: 'POST',
                    body: JSON.stringify({
                        channelToken: isRelayService ? session.channelToken : undefined,
                        token: isGrantByPermission ? session.token : undefined,
                    }),
                    signal,
                });
                if (response.data?.fid) {
                    session.profileId = response.data.fid;
                }
                const data = resolveFireflyResponseData(response);
                if (data.accountId && data.accessToken) {
                    return new FireflySession(data.accountId, data.accessToken);
                }
                return null;
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
