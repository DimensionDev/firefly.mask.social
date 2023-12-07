import { useMemo } from 'react';

import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function usePlatformProfile() {
    const currentLensAccount = useLensStateStore.use.currentProfile?.();
    const currentFarcasterAccount = useFarcasterStateStore.use.currentProfile?.();

    return useMemo(() => {
        return {
            lens: currentLensAccount,
            farcaster: currentFarcasterAccount,
        };
    }, [currentLensAccount, currentFarcasterAccount]);
}
