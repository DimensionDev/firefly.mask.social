import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

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
