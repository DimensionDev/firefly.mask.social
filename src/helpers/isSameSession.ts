import type { Session } from '@/providers/types/Session.js';

export function isSameSession(session: Session | null, otherSession: Session | null) {
    if (!session || !otherSession) return false;
    return session.type === otherSession.type && session.profileId === otherSession.profileId;
}
