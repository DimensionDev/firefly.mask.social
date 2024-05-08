import { resolveProfileStoreFromSessionType } from '@/helpers/resolveProfileStore.js';
import { resolveSessionHolder } from '@/helpers/resolveSessionHolder.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import type { LensSession } from '@/providers/lens/Session.js';
import { type Profile } from '@/providers/types/SocialMedia.js';

export function restoreProfile(
    currentProfile: Profile,
    profiles: Profile[],
    session: FarcasterSession | LensSession | FireflySession,
) {
    const store = resolveProfileStoreFromSessionType(session.type);
    store?.getState().updateProfiles(profiles);
    store?.getState().updateCurrentProfile(currentProfile, session);
    resolveSessionHolder(session.type)?.resumeSession(session);
}

export function restoreSessionForFirefly(session: FireflySession | null) {
    if (!session) return;
    resolveSessionHolder(session.type)?.resumeSession(session);
}
