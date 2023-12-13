import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface UseProfilesReturnType {
    currentProfile: Profile | null;
    profiles: Profile[];
    clearCurrentProfile: () => void;
}

export function useProfiles(platform: SocialPlatform): UseProfilesReturnType {
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const clearFarcasterCurrentProfile = useFarcasterStateStore.use.clearCurrentProfile();
    const clearLensCurrentProfile = useLensStateStore.use.clearCurrentProfile();

    return useMemo(() => {
        switch (platform) {
            case SocialPlatform.Lens:
                return {
                    currentProfile: currentLensProfile,
                    profiles: lensProfiles,
                    clearCurrentProfile: clearLensCurrentProfile,
                };
            case SocialPlatform.Farcaster:
                return {
                    currentProfile: currentFarcasterProfile,
                    profiles: farcasterProfiles,
                    clearCurrentProfile: clearFarcasterCurrentProfile,
                };
            default:
                safeUnreachable(platform);
                return {
                    currentProfile: null,
                    profiles: EMPTY_LIST,
                    clearCurrentProfile: () => {},
                };
        }
    }, [
        currentLensProfile,
        currentFarcasterProfile,
        platform,
        lensProfiles,
        farcasterProfiles,
        clearFarcasterCurrentProfile,
        clearLensCurrentProfile,
    ]);
}
