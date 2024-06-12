import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { LensSession } from '@/providers/lens/Session.js';
import type { TwitterSession } from '@/providers/twitter/Session.js';
import type { BindResponse } from '@/providers/types/Firefly.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { settings } from '@/settings/index.js';

async function bindLensSessionToFirefly(session: LensSession, signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetch<BindResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/bindLens'),
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
    const response = await fireflySessionHolder.fetch<BindResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/bindFarcaster'),
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

async function bindTwitterSessionToFirefly(session: TwitterSession, signal?: AbortSignal) {
    throw new Error('Not implemented.');
}

/**
 * Bind a lens or farcaster session to the currently logged-in Firefly session.
 * @param session
 * @param signal
 * @returns
 */
export async function bindSessionToFirefly(session: Session, signal?: AbortSignal) {
    // Ensure that the Firefly session is resumed before calling this function.
    fireflySessionHolder.assertSession();

    switch (session.type) {
        case SessionType.Farcaster:
            return await bindFarcasterSessionToFirefly(session as FarcasterSession, signal);
        case SessionType.Lens:
            return await bindLensSessionToFirefly(session as LensSession, signal);
        case SessionType.Twitter:
            return await bindTwitterSessionToFirefly(session as TwitterSession, signal);
        case SessionType.Firefly:
            throw new Error('Not Allowed.');
        default:
            safeUnreachable(session.type);
            throw new Error('Unknown session type');
    }
}
