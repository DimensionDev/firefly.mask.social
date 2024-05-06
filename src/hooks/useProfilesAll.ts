import { useMemo } from 'react';

import { Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useProfilesAll() {
    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const twitterProfiles = useTwitterStateStore.use.profiles();

    return useMemo<Record<Source, Profile[]>>(
        () => ({
            [Source.Farcaster]: farcasterProfiles,
            [Source.Lens]: lensProfiles,
            [Source.Twitter]: twitterProfiles,
            [Source.Article]: EMPTY_LIST,
        }),
        [lensProfiles, farcasterProfiles, twitterProfiles],
    );
}
