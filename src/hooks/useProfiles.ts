import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

interface UseProfilesReturnType {
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    profiles: Profile[];
    clearCurrentProfile: () => void;
    refreshCurrentProfile: (profile: Profile) => void;
    updateProfiles: (profiles: Profile[]) => void;
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
    const refreshFarcasterProfile = useFarcasterStateStore.use.refreshCurrentProfile();
    const refreshLensProfile = useLensStateStore.use.refreshCurrentProfile();
    const updateLensProfiles = useLensStateStore.use.updateProfiles();
    const updateFarcasterProfiles = useFarcasterStateStore.use.updateProfiles();

    return useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return {
                    currentProfile: currentLensProfile,
                    currentProfileSession: currentLensProfileSession,
                    profiles: lensProfiles,
                    clearCurrentProfile: clearLensCurrentProfile,
                    refreshCurrentProfile: refreshLensProfile,
                    updateProfiles: updateLensProfiles,
                };
            case SocialPlatform.Farcaster:
                return {
                    currentProfile: currentFarcasterProfile,
                    currentProfileSession: currentFarcasterProfileSession,
                    profiles: farcasterProfiles,
                    clearCurrentProfile: clearFarcasterCurrentProfile,
                    refreshCurrentProfile: refreshFarcasterProfile,
                    updateProfiles: updateFarcasterProfiles,
                };
            default:
                safeUnreachable(source);
                return {
                    currentProfile: null,
                    currentProfileSession: null,
                    profiles: EMPTY_LIST,
                    clearCurrentProfile: () => {},
                    refreshCurrentProfile: (profile: Profile) => {},
                    updateProfiles: (profiles: Profile[]) => {},
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
        refreshFarcasterProfile,
        refreshLensProfile,
        updateLensProfiles,
        updateFarcasterProfiles,
    ]);
}
