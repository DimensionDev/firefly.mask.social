import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { NotAllowedError, UnreachableError } from '@/constants/error.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import type { BindResponse } from '@/providers/types/Firefly.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { restoreFireflySession } from '@/services/restoreFireflySession.js';
import { settings } from '@/settings/index.js';
import type { ResponseJSON } from '@/types/index.js';

async function bindLensToFirefly(session: LensSession, signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetch<BindResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v3/user/bindLens'),
        {
            method: 'POST',
            body: JSON.stringify({
                accessToken: session.token,
                isForce: false,
            }),
            signal,
        },
    );

    const data = resolveFireflyResponseData(response);
    return data;
}

async function bindFarcasterSessionToFirefly(session: FarcasterSession, signal?: AbortSignal) {
    const isGrantByPermission = FarcasterSession.isGrantByPermission(session, true);
    const isRelayService = FarcasterSession.isRelayService(session);

    if (!isGrantByPermission && !isRelayService)
        throw new NotAllowedError(
            '[bindFarcasterSessionToFirefly] Only grant-by-permission or relay service sessions are allowed.',
        );

    const response = await fireflySessionHolder.fetch<BindResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v3/user/bindFarcaster'),
        {
            method: 'POST',
            body: JSON.stringify({
                token: isGrantByPermission ? session.signerRequestToken : undefined,
                channelToken: isRelayService ? session.channelToken : undefined,
                isForce: false,
            }),
            signal,
        },
    );

    const data = resolveFireflyResponseData(response);
    return data;
}

async function bindTwitterSessionToFirefly(session: TwitterSession, signal?: AbortSignal) {
    const encrypted = await fetchJSON<ResponseJSON<string>>('/api/twitter/auth', {
        method: 'POST',
        headers: TwitterSession.payloadToHeaders(session.payload),
        signal,
    });
    if (!encrypted.success)
        throw new Error(`[bindTwitterSessionToFirefly] Failed to encrypt twitter session: ${encrypted.error.message}.`);

    const response = await fireflySessionHolder.fetch<BindResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/exchange/bindTwitter'),
        {
            method: 'POST',
            body: JSON.stringify({
                data: encrypted.data,
            }),
            signal,
        },
    );

    const data = resolveFireflyResponseData(response);
    return data;
}

/**
 * Bind a lens or farcaster session to the currently logged-in Firefly session.
 * @param session
 * @param signal
 * @returns
 */
async function bindFireflySession(session: Session, signal?: AbortSignal) {
    // Ensure that the Firefly session is resumed before calling this function.
    fireflySessionHolder.assertSession();

    switch (session.type) {
        case SessionType.Farcaster:
            return await bindFarcasterSessionToFirefly(session as FarcasterSession, signal);
        case SessionType.Lens:
            return await bindLensToFirefly(session as LensSession, signal);
        case SessionType.Twitter:
            return await bindTwitterSessionToFirefly(session as TwitterSession, signal);
        case SessionType.Firefly:
            throw new NotAllowedError();
        case SessionType.Apple:
        case SessionType.Google:
        case SessionType.Telegram:
            throw new NotAllowedError();
        default:
            safeUnreachable(session.type);
            throw new UnreachableError('[bindFireflySession] session type', session.type);
    }
}

export async function bindOrRestoreFireflySession(session: Session, signal?: AbortSignal) {
    try {
        const farcasterSession = session as FarcasterSession;
        if (FarcasterSession.isCustodyWallet(farcasterSession)) throw new NotAllowedError();

        if (fireflySessionHolder.session) {
            const response = await bindFireflySession(session, signal);

            if (FarcasterSession.isRelayService(session)) {
                session.profileId = response.fid;
            }

            // this will return the existing session
            return fireflySessionHolder.assertSession();
        } else {
            throw new Error('Firefly session is not available');
        }
    } catch (error) {
        console.error(`[bindOrRestoreFireflySession] failed to bind firefly session ${error}`);

        // this will create a new session
        return restoreFireflySession(session, signal);
    }
}
