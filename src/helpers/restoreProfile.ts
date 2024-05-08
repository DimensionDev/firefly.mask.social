import { resolveProfileStoreFromSessionType } from '@/helpers/resolveProfileStore.js';
import { resolveSessionHolder } from '@/helpers/resolveSessionHolder.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { LensSession } from '@/providers/lens/Session.js';
import { type Profile } from '@/providers/types/SocialMedia.js';

export function restoreProfile(currentProfile: Profile, profiles: Profile[], session: FarcasterSession | LensSession) {
    const store = resolveProfileStoreFromSessionType(session.type);
    const holder = resolveSessionHolder(session.type);

    store?.getState().updateProfiles(profiles);
    store?.getState().updateCurrentProfile(currentProfile, session);
    holder?.resumeSession(session);
}
