import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

interface UseProfilesReturnType {
    currentProfile: Profile | null;
    currentProfileSession: Session | null;
    profiles: Profile[];
    clearCurrentProfile: () => void;
    refreshProfiles: () => void;
    refreshCurrentProfile: () => void;
}

export function useProfiles(source: SocialPlatform): UseProfilesReturnType {
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentLensProfileSession = useLensStateStore.use.currentProfileSession();

    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentFarcasterProfileSession = useFarcasterStateStore.use.currentProfileSession();

    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();
    const currentTwitterProfileSession = useTwitterStateStore.use.currentProfileSession();

    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const twitterProfiles = useTwitterStateStore.use.profiles();

    const clearFarcasterCurrentProfile = useFarcasterStateStore.use.clearCurrentProfile();
    const clearLensCurrentProfile = useLensStateStore.use.clearCurrentProfile();
    const clearTwitterCurrentProfile = useTwitterStateStore.use.clearCurrentProfile();

    const refreshLensProfiles = useLensStateStore.use.refreshProfiles();
    const refreshFarcasterProfiles = useFarcasterStateStore.use.refreshProfiles();
    const refreshTwitterProfiles = useTwitterStateStore.use.refreshProfiles();

    const refreshLensProfile = useLensStateStore.use.refreshCurrentProfile();
    const refreshFarcasterProfile = useFarcasterStateStore.use.refreshCurrentProfile();
    const refreshTwitterProfile = useTwitterStateStore.use.refreshCurrentProfile();

    return useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return {
                    currentProfile: currentLensProfile,
                    currentProfileSession: currentLensProfileSession,
                    profiles: lensProfiles,
                    clearCurrentProfile: clearLensCurrentProfile,
                    refreshProfiles: refreshLensProfiles,
                    refreshCurrentProfile: refreshLensProfile,
                };
            case SocialPlatform.Farcaster:
                return {
                    currentProfile: currentFarcasterProfile,
                    currentProfileSession: currentFarcasterProfileSession,
                    profiles: farcasterProfiles,
                    clearCurrentProfile: clearFarcasterCurrentProfile,
                    refreshProfiles: refreshFarcasterProfiles,
                    refreshCurrentProfile: refreshFarcasterProfile,
                };
            case SocialPlatform.Twitter:
                return {
                    currentProfile: currentTwitterProfile,
                    currentProfileSession: currentTwitterProfileSession,
                    profiles: twitterProfiles,
                    clearCurrentProfile: clearTwitterCurrentProfile,
                    refreshProfiles: refreshTwitterProfiles,
                    refreshCurrentProfile: refreshTwitterProfile,
                };
            default:
                safeUnreachable(source);
                return {
                    currentProfile: null,
                    currentProfileSession: null,
                    profiles: EMPTY_LIST,
                    clearCurrentProfile: () => {},
                    refreshCurrentProfile: () => {},
                    refreshProfiles: () => {},
                };
        }
    }, [
        source,
        currentLensProfile,
        currentLensProfileSession,
        lensProfiles,
        clearLensCurrentProfile,
        refreshLensProfiles,
        refreshLensProfile,
        currentFarcasterProfile,
        currentFarcasterProfileSession,
        farcasterProfiles,
        clearFarcasterCurrentProfile,
        refreshFarcasterProfiles,
        refreshFarcasterProfile,
        currentTwitterProfile,
        currentTwitterProfileSession,
        twitterProfiles,
        clearTwitterCurrentProfile,
        refreshTwitterProfiles,
        refreshTwitterProfile,
    ]);
}
