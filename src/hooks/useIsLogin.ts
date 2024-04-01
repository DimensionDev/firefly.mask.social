import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useIsLogin(source?: SocialPlatform) {
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    return useMemo(() => {
        if (!source) return !!(currentLensProfile?.profileId || currentFarcasterProfile?.profileId);

        switch (source) {
            case SocialPlatform.Lens:
                return !!currentLensProfile?.profileId;
            case SocialPlatform.Farcaster:
                return !!currentFarcasterProfile?.profileId;
            case SocialPlatform.Twitter:
                return !!currentTwitterProfile?.profileId;
            default:
                safeUnreachable(source);
                return false;
        }
    }, [source, currentLensProfile?.profileId, currentFarcasterProfile?.profileId, currentTwitterProfile?.profileId]);
}
