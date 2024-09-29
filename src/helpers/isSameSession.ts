import { safeUnreachable } from '@masknet/kit';

import { UnreachableError } from '@/constants/error.js';
import type { LensSession } from '@/providers/lens/Session.js';
import type { TwitterSession } from '@/providers/twitter/Session.js';
import type { SessionPayload } from '@/providers/twitter/SessionPayload.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

export function isSameSession(session: Session | null, otherSession: Session | null, strict = false) {
    if (!session || !otherSession) return false;
    const checked = session.type === otherSession.type && session.profileId === otherSession.profileId;
    if (!strict || !checked) return checked;

    switch (session.type) {
        case SessionType.Farcaster:
            // compare private keys
            return (
                session.token === otherSession.token ||
                !!(session.profileId && otherSession.profileId && session.profileId === otherSession.profileId)
            );
        case SessionType.Lens:
            const lensSession = session as LensSession;
            const otherLensSession = otherSession as LensSession;
            return (
                lensSession.token === otherLensSession.token &&
                lensSession.refreshToken === otherLensSession.refreshToken
            );
        case SessionType.Twitter:
            const twitterSession = session as TwitterSession;
            const otherTwitterSession = otherSession as TwitterSession;
            return isSameSessionPayload(twitterSession.payload, otherTwitterSession.payload);
        case SessionType.Firefly:
            return session.token === otherSession.token;
        default:
            safeUnreachable(session.type);
            throw new UnreachableError('session type', session);
    }
}

/**
 * Check if two session payloads are the same.
 *
 * For twitter only.
 * @param sessionPayload
 * @param otherSessionPayload
 * @returns
 */
export function isSameSessionPayload(
    sessionPayload?: SessionPayload | null,
    otherSessionPayload?: SessionPayload | null,
) {
    if (!sessionPayload || !otherSessionPayload) return false;
    return (
        sessionPayload.accessToken === otherSessionPayload.accessToken &&
        sessionPayload.accessTokenSecret === otherSessionPayload.accessTokenSecret
    );
}
