import { noop } from 'lodash-es';
import { useMemo } from 'react';

import { Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
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
        const store = {
            [Source.Farcaster]: {
                currentProfile: currentFarcasterProfile,
                currentProfileSession: currentFarcasterProfileSession,
                profiles: farcasterProfiles,
                clearCurrentProfile: clearFarcasterCurrentProfile,
                refreshProfiles: refreshFarcasterProfiles,
                refreshCurrentProfile: refreshFarcasterProfile,
            },
            [Source.Lens]: {
                currentProfile: currentLensProfile,
                currentProfileSession: currentLensProfileSession,
                profiles: lensProfiles,
                clearCurrentProfile: clearLensCurrentProfile,
                refreshProfiles: refreshLensProfiles,
                refreshCurrentProfile: refreshLensProfile,
            },
            [Source.Twitter]: {
                currentProfile: currentTwitterProfile,
                currentProfileSession: currentTwitterProfileSession,
                profiles: twitterProfiles,
                clearCurrentProfile: clearTwitterCurrentProfile,
                refreshProfiles: refreshTwitterProfiles,
                refreshCurrentProfile: refreshTwitterProfile,
            },
            [Source.Article]: {
                currentProfile: null,
                currentProfileSession: null,
                profiles: EMPTY_LIST,
                clearCurrentProfile: noop,
                refreshProfiles: noop,
                refreshCurrentProfile: noop,
            },
        };
        return store as Record<Source, (typeof store)[Source]>;
    }, [
        clearFarcasterCurrentProfile,
        clearLensCurrentProfile,
        clearTwitterCurrentProfile,
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
