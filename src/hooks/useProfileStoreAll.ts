import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useProfileStoreAll() {
    const lensProfiles = useLensStateStore.use.profiles();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentLensProfileSession = useLensStateStore.use.currentProfileSession();

    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentFarcasterProfileSession = useFarcasterStateStore.use.currentProfileSession();

    const twitterProfiles = useTwitterStateStore.use.profiles();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();
    const currentTwitterProfileSession = useTwitterStateStore.use.currentProfileSession();

    const clearFarcaster = useFarcasterStateStore.use.clear();
    const clearLens = useLensStateStore.use.clear();
    const clearTwitter = useTwitterStateStore.use.clear();

    const refreshLensProfiles = useLensStateStore.use.refreshProfiles();
    const refreshFarcasterProfiles = useFarcasterStateStore.use.refreshProfiles();
    const refreshTwitterProfiles = useTwitterStateStore.use.refreshProfiles();

    const refreshLensProfile = useLensStateStore.use.refreshCurrentProfile();
    const refreshFarcasterProfile = useFarcasterStateStore.use.refreshCurrentProfile();
    const refreshTwitterProfile = useTwitterStateStore.use.refreshCurrentProfile();

    return useMemo(() => {
        const store = {
            [Source.Farcaster]: {
                currentProfile: currentFarcasterProfile,
                currentProfileSession: currentFarcasterProfileSession,
                profiles: farcasterProfiles,
                refreshProfiles: refreshFarcasterProfiles,
                refreshCurrentProfile: refreshFarcasterProfile,
                clear: clearFarcaster,
            },
            [Source.Lens]: {
                currentProfile: currentLensProfile,
                currentProfileSession: currentLensProfileSession,
                profiles: lensProfiles,
                refreshProfiles: refreshLensProfiles,
                refreshCurrentProfile: refreshLensProfile,
                clear: clearLens,
            },
            [Source.Twitter]: {
                currentProfile: currentTwitterProfile,
                currentProfileSession: currentTwitterProfileSession,
                profiles: twitterProfiles,
                refreshProfiles: refreshTwitterProfiles,
                refreshCurrentProfile: refreshTwitterProfile,
                clear: clearTwitter,
            },
        };
        return store as Record<SocialSource, (typeof store)[SocialSource]>;
    }, [
        clearFarcaster,
        clearLens,
        clearTwitter,
        currentFarcasterProfile,
        currentFarcasterProfileSession,
        currentLensProfile,
        currentLensProfileSession,
        currentTwitterProfile,
        currentTwitterProfileSession,
        farcasterProfiles,
        lensProfiles,
        refreshFarcasterProfile,
        refreshFarcasterProfiles,
        refreshLensProfile,
        refreshLensProfiles,
        refreshTwitterProfile,
        refreshTwitterProfiles,
        twitterProfiles,
    ]);
}
