import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

function useProfileStoreAll() {
    const lensStatus = useLensStateStore.use.status();
    const lensAccounts = useLensStateStore.use.accounts();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentLensProfileSession = useLensStateStore.use.currentProfileSession();

    const farcasterStatus = useFarcasterStateStore.use.status();
    const farcasterAccounts = useFarcasterStateStore.use.accounts();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentFarcasterProfileSession = useFarcasterStateStore.use.currentProfileSession();

    const twitterStatus = useTwitterStateStore.use.status();
    const twitterAccounts = useTwitterStateStore.use.accounts();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();
    const currentTwitterProfileSession = useTwitterStateStore.use.currentProfileSession();

    return useMemo(() => {
        const store = {
            [Source.Farcaster]: {
                status: farcasterStatus,
                currentProfile: currentFarcasterProfile,
                currentProfileSession: currentFarcasterProfileSession,
                accounts: farcasterAccounts,
                profiles: farcasterAccounts.map((x) => x.profile),
            },
            [Source.Lens]: {
                status: lensStatus,
                currentProfile: currentLensProfile,
                currentProfileSession: currentLensProfileSession,
                accounts: lensAccounts,
                profiles: lensAccounts.map((x) => x.profile),
            },
            [Source.Twitter]: {
                status: twitterStatus,
                currentProfile: currentTwitterProfile,
                currentProfileSession: currentTwitterProfileSession,
                accounts: twitterAccounts,
                profiles: twitterAccounts.map((x) => x.profile),
            },
        };
        return store as Record<SocialSource, (typeof store)[SocialSource]>;
    }, [
        farcasterStatus,
        currentFarcasterProfile,
        currentFarcasterProfileSession,
        farcasterAccounts,
        lensStatus,
        currentLensProfile,
        currentLensProfileSession,
        lensAccounts,
        twitterStatus,
        currentTwitterProfile,
        currentTwitterProfileSession,
        twitterAccounts,
    ]);
}

export function useProfileStore(source: SocialSource) {
    const all = useProfileStoreAll();
    return all[source];
}
