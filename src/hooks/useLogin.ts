import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { SocialPlatform } from '@/constants/enum.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function useLogin(platform?: SocialPlatform) {
    const account = useAccount();
    const currentLensAccount = useLensStateStore.use.currentAccount();
    const currentFarcasterAccount = useFarcasterStateStore.use.currentAccount();

    return useMemo(() => {
        if (!account.isConnected) return false;
        if (platform) {
            switch (platform) {
                case SocialPlatform.Lens:
                    return !!currentLensAccount.id;
                case SocialPlatform.Farcaster:
                    return !!currentFarcasterAccount.id;
                default:
                    return false;
            }
        }
        return currentLensAccount.id || currentFarcasterAccount.id;
    }, [currentLensAccount, currentFarcasterAccount, platform, account]);
}
