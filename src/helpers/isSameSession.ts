import { BaseSession } from '@/providers/base/Session.js';

export function isSameSession(session: BaseSession | null, otherSession: BaseSession | null) {
    if (!session || !otherSession) return false;
    return session.type === otherSession.type && session.profileId === otherSession.profileId;
}
