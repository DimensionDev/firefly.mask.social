import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useProfileStoreAll() {
    const lensProfiles = useLensStateStore.use.accounts().map((x) => x.profile);
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentLensProfileSession = useLensStateStore.use.currentProfileSession();

    const farcasterProfiles = useFarcasterStateStore.use.accounts().map((x) => x.profile);
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentFarcasterProfileSession = useFarcasterStateStore.use.currentProfileSession();

    const twitterProfiles = useTwitterStateStore.use.accounts().map((x) => x.profile);
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();
    const currentTwitterProfileSession = useTwitterStateStore.use.currentProfileSession();

    const clearFarcaster = useFarcasterStateStore.use.clear();
    const clearLens = useLensStateStore.use.clear();
    const clearTwitter = useTwitterStateStore.use.clear();

    const refreshLensAccounts = useLensStateStore.use.refreshAccounts();
    const refreshFarcasterAccounts = useFarcasterStateStore.use.refreshAccounts();
    const refreshTwitterAccounts = useTwitterStateStore.use.refreshAccounts();

    const refreshLensAccount = useLensStateStore.use.refreshCurrentAccount();
    const refreshFarcasterAccount = useFarcasterStateStore.use.refreshCurrentAccount();
    const refreshTwitterAccount = useTwitterStateStore.use.refreshCurrentAccount();

    return useMemo(() => {
        const store = {
            [Source.Farcaster]: {
                currentProfile: currentFarcasterProfile,
                currentProfileSession: currentFarcasterProfileSession,
                profiles: farcasterProfiles,
                refreshAccounts: refreshFarcasterAccounts,
                refreshCurrentAccount: refreshFarcasterAccount,
                clear: clearFarcaster,
            },
            [Source.Lens]: {
                currentProfile: currentLensProfile,
                currentProfileSession: currentLensProfileSession,
                profiles: lensProfiles,
                refreshAccounts: refreshLensAccounts,
                refreshCurrentAccount: refreshLensAccount,
                clear: clearLens,
            },
            [Source.Twitter]: {
                currentProfile: currentTwitterProfile,
                currentProfileSession: currentTwitterProfileSession,
                profiles: twitterProfiles,
                refreshAccounts: refreshTwitterAccounts,
                refreshCurrentAccount: refreshTwitterAccount,
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
        refreshFarcasterAccount,
        refreshFarcasterAccounts,
        refreshLensAccount,
        refreshLensAccounts,
        refreshTwitterAccount,
        refreshTwitterAccounts,
        twitterProfiles,
    ]);
}
