import { compact, first } from 'lodash-es';
import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useCurrentProfile(source: SocialSource) {
    const all = useCurrentProfileAll();
    return all[source];
}

export function useCurrentProfileFirstAvailable() {
    const all = useCurrentProfileAll();
    return first(compact(SORTED_SOCIAL_SOURCES.map((x) => all[x]))) ?? null;
}

export function useCurrentProfileAll() {
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    return useMemo<Record<SocialSource, Profile | null>>(
        () => ({
            [Source.Farcaster]: currentFarcasterProfile,
            [Source.Lens]: currentLensProfile,
            [Source.Twitter]: currentTwitterProfile,
        }),
        [currentFarcasterProfile, currentLensProfile, currentTwitterProfile],
    );
}
