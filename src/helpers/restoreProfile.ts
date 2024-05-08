import { safeUnreachable } from '@masknet/kit';

import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import type { LensSession } from '@/providers/lens/Session.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { type Profile, SessionType } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export function restoreProfile(currentProfile: Profile, profiles: Profile[], session: FarcasterSession | LensSession) {
    switch (session.type) {
        case SessionType.Farcaster:
            useFarcasterStateStore.getState().updateProfiles(profiles);
            useFarcasterStateStore.getState().updateCurrentProfile(currentProfile, session);
            farcasterSessionHolder.resumeSession(session);
            break;
        case SessionType.Lens:
            useLensStateStore.getState().updateProfiles(profiles);
            useLensStateStore.getState().updateCurrentProfile(currentProfile, session);
            lensSessionHolder.resumeSession(session);
            break;
        case SessionType.Firefly:
            // do nothing
            break;
        case SessionType.Twitter:
            // do nothing
            break;
        default:
            safeUnreachable(session.type);
            console.error('Unknown session type:', session);
            break;
    }
}
