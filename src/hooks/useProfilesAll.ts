import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useProfilesAll() {
    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const twitterProfiles = useTwitterStateStore.use.profiles();

    return useMemo<Record<SocialSource, Profile[]>>(
        () => ({
            [Source.Farcaster]: farcasterProfiles,
            [Source.Lens]: lensProfiles,
            [Source.Twitter]: twitterProfiles,
        }),
        [lensProfiles, farcasterProfiles, twitterProfiles],
    );
}
