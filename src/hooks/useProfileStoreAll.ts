import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useProfileStoreAll() {
    const lensAccounts = useLensStateStore.use.accounts();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentLensProfileSession = useLensStateStore.use.currentProfileSession();

    const farcasterAccounts = useFarcasterStateStore.use.accounts();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentFarcasterProfileSession = useFarcasterStateStore.use.currentProfileSession();

    const twitterAccounts = useTwitterStateStore.use.accounts();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();
    const currentTwitterProfileSession = useTwitterStateStore.use.currentProfileSession();

    return useMemo(() => {
        const store = {
            [Source.Farcaster]: {
                currentProfile: currentFarcasterProfile,
                currentProfileSession: currentFarcasterProfileSession,
                accounts: farcasterAccounts,
                profiles: farcasterAccounts.map((x) => x.profile),
            },
            [Source.Lens]: {
                currentProfile: currentLensProfile,
                currentProfileSession: currentLensProfileSession,
                accounts: lensAccounts,
                profiles: lensAccounts.map((x) => x.profile),
            },
            [Source.Twitter]: {
                currentProfile: currentTwitterProfile,
                currentProfileSession: currentTwitterProfileSession,
                accounts: twitterAccounts,
                profiles: twitterAccounts.map((x) => x.profile),
            },
        };
        return store as Record<SocialSource, (typeof store)[SocialSource]>;
    }, [
        currentFarcasterProfile,
        currentFarcasterProfileSession,
        currentLensProfile,
        currentLensProfileSession,
        currentTwitterProfile,
        currentTwitterProfileSession,
        farcasterAccounts,
        lensAccounts,
        twitterAccounts,
    ]);
}
