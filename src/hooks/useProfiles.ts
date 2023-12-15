import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface UseProfilesReturnType {
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    profiles: Profile[];
    clearCurrentProfile: () => void;
}

export function useProfiles(source: SocialPlatform): UseProfilesReturnType {
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentLensProfileSession = useLensStateStore.use.currentProfileSession();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentFarcasterProfileSession = useFarcasterStateStore.use.currentProfileSession();
    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const clearFarcasterCurrentProfile = useFarcasterStateStore.use.clearCurrentProfile();
    const clearLensCurrentProfile = useLensStateStore.use.clearCurrentProfile();

    return useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return {
                    currentProfile: currentLensProfile,
                    currentProfileSession: currentLensProfileSession,
                    profiles: lensProfiles,
                    clearCurrentProfile: clearLensCurrentProfile,
                };
            case SocialPlatform.Farcaster:
                return {
                    currentProfile: currentFarcasterProfile,
                    currentProfileSession: currentFarcasterProfileSession,
                    profiles: farcasterProfiles,
                    clearCurrentProfile: clearFarcasterCurrentProfile,
                };
            default:
                safeUnreachable(source);
                return {
                    currentProfile: null,
                    currentProfileSession: null,
                    profiles: EMPTY_LIST,
                    clearCurrentProfile: () => {},
                };
        }
    }, [
        currentLensProfile,
        currentLensProfileSession,
        currentFarcasterProfile,
        currentFarcasterProfileSession,
        source,
        lensProfiles,
        farcasterProfiles,
        clearFarcasterCurrentProfile,
        clearLensCurrentProfile,
    ]);
}
