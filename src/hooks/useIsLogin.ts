import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { SocialPlatform } from '@/constants/enum.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function useIsLogin(platform?: SocialPlatform) {
    const account = useAccount();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    return useMemo(() => {
        if (!account.isConnected) return false;

        if (platform) {
            switch (platform) {
                case SocialPlatform.Lens:
                    return !!currentLensProfile?.profileId;
                case SocialPlatform.Farcaster:
                    return !!currentFarcasterProfile?.profileId;
                default:
                    safeUnreachable(platform);
                    return false;
            }
        }
        return !!(currentLensProfile?.profileId || currentFarcasterProfile?.profileId);
    }, [currentLensProfile, currentFarcasterProfile, platform, account]);
}
