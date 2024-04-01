import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useProfilesAll() {
    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const twitterProfiles = useTwitterStateStore.use.profiles();

    return useMemo<Record<SocialPlatform, Profile[]>>(
        () => ({
            [SocialPlatform.Farcaster]: farcasterProfiles,
            [SocialPlatform.Lens]: lensProfiles,
            [SocialPlatform.Twitter]: twitterProfiles,
        }),
        [lensProfiles, farcasterProfiles, twitterProfiles],
    );
}
