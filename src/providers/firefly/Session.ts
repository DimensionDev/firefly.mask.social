import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { restoreProfile } from '@/helpers/restoreProfile.js';
import { BaseSession } from '@/providers/base/Session.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { FarcasterLoginResponse, LensLoginResponse } from '@/providers/types/Firefly.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export class FireflySession extends BaseSession implements Session {
    constructor(
        accountId: string,
        accessToken: string,
        public parent: Session,
    ) {
        super(SessionType.Firefly, accountId, accessToken, 0, 0);
    }

    override serialize(): `${SessionType}:${string}:${string}` {
        return `${super.serialize()}:${btoa(this.parent.serialize())}`;
    }

    override async refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    override async destroy(): Promise<void> {
        throw new Error('Not allowed');
    }

    static async from(session: Session, signal?: AbortSignal): Promise<FireflySession> {
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
                return new FireflySession(data.accountId, data.accessToken, session);
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
                        token: isGrantByPermission ? session.signerRequestToken : undefined,
                    }),
                    signal,
                });
                const data = resolveFireflyResponseData(response);

                if (data.fid && data.accountId && data.accessToken) {
                    session.profileId = `${data.fid}`;
                    return new FireflySession(data.accountId, data.accessToken, session);
                }

                throw new Error(response.error ? response.error.join('\n') : 'Failed to restore farcaster profile.');
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
