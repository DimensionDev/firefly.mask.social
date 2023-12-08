import { useMemo } from 'react';

import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function usePlatformProfile() {
    const currentLensProfile = useLensStateStore.use.currentProfile?.();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    return useMemo(() => {
        return {
            lens: currentLensProfile,
            farcaster: currentFarcasterProfile,
        };
    }, [currentLensProfile, currentFarcasterProfile]);
}
