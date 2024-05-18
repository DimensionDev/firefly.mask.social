import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { LensSession } from '@/providers/lens/Session.js';
import type { BindResponse } from '@/providers/types/Firefly.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

async function bindLensSessionToFirefly(session: LensSession, signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetch<BindResponse>(urlcat(FIREFLY_ROOT_URL, '/v1/user/bindLens'), {
        method: 'POST',
        body: JSON.stringify({
            accessToken: session.token,
            isForce: false,
        }),
        signal,
    });

    const data = resolveFireflyResponseData(response);
    return data;
}

async function bindFarcasterSessionToFirefly(session: FarcasterSession, signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetch<BindResponse>(
        urlcat(FIREFLY_ROOT_URL, '/v1/user/bindFarcaster'),
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

/**
 * Bind a lens or farcaster session to the currently logged-in Firefly session.
 * ! Make sure resume firefly session before calling this function.
 * @param session
 * @param signal
 * @returns
 */
export async function bindSessionToFirefly(session: Session, signal?: AbortSignal) {
    switch (session.type) {
        case SessionType.Farcaster:
            return await bindFarcasterSessionToFirefly(session as FarcasterSession, signal);
        case SessionType.Lens:
            return await bindLensSessionToFirefly(session as LensSession, signal);
        case SessionType.Twitter:
            throw new Error('Not Allowed.');
        case SessionType.Firefly:
            throw new Error('Not Allowed.');
        default:
            throw new Error('Unknown session type');
    }
}
