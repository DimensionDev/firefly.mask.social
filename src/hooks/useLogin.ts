import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function useLogin(platform?: SocialPlatform) {
    const currentLensAccount = useLensStateStore.use.currentAccount?.();
    const currentFarcasterAccount = useFarcasterStateStore.use.accounts();

    return useMemo(() => {
        if (platform) {
            switch (platform) {
                case SocialPlatform.Lens:
                    return !!currentLensAccount;
                case SocialPlatform.Farcaster:
                    return !!currentFarcasterAccount;
                default:
                    return false;
            }
        }
        return currentLensAccount || currentFarcasterAccount;
    }, [currentLensAccount, currentFarcasterAccount, platform]);
}
