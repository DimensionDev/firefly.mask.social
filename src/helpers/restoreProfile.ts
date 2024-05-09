import { resolveSessionHolderFromSessionType } from '@/helpers/resolveSessionHolder.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import type { LensSession } from '@/providers/lens/Session.js';
import { type Profile, SessionType } from '@/providers/types/SocialMedia.js';
import {
    useFarcasterStateStore,
    useFireflyStateStore,
    useLensStateStore,
    useTwitterStateStore,
} from '@/store/useProfileStore.js';

export function restoreProfile(
    currentProfile: Profile,
    profiles: Profile[],
    session: FarcasterSession | LensSession | FireflySession,
) {
    const store = {
        [SessionType.Farcaster]: useFarcasterStateStore,
        [SessionType.Lens]: useLensStateStore,
        [SessionType.Firefly]: useFireflyStateStore,
        [SessionType.Twitter]: useTwitterStateStore,
    }[session.type];

    store?.getState().updateProfiles(profiles);
    store?.getState().updateCurrentProfile(currentProfile, session);
    resolveSessionHolderFromSessionType(session.type)?.resumeSession(session);
}

export function restoreSessionForFirefly(session: FireflySession | null) {
    if (!session) return;
    resolveSessionHolderFromSessionType(session.type)?.resumeSession(session);
}
