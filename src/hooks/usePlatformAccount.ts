import { useMemo } from 'react';

import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function usePlatformAccount() {
    const currentLensAccount = useLensStateStore.use.currentAccount?.();
    const currentFarcasterAccount = useFarcasterStateStore.use.currentAccount?.();

    return useMemo(() => {
        return {
            lens: currentLensAccount,
            farcaster: currentFarcasterAccount,
        };
    }, [currentLensAccount, currentFarcasterAccount]);
}
