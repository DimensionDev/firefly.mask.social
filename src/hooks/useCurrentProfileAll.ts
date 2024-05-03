import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useCurrentProfileAll() {
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    return useMemo<Record<SocialPlatform, Profile | null>>(
        () => ({
            [SocialPlatform.Farcaster]: currentFarcasterProfile,
            [SocialPlatform.Lens]: currentLensProfile,
            [SocialPlatform.Twitter]: currentTwitterProfile,
            [SocialPlatform.Article]: null,
        }),
        [currentFarcasterProfile, currentLensProfile, currentTwitterProfile],
    );
}
