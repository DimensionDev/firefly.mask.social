import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { SocialPlatform } from '@/constants/enum.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';
import { isSameAddress } from '@/maskbook/packages/web3-shared/base/src/index.js';

export function useIsLogin(source?: SocialPlatform) {
    const account = useAccount();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const isLensLogin = currentLensProfile?.signless ? currentLensProfile.profileId : (currentLensProfile?.profileId && isSameAddress(currentLensProfile.ownedBy?.address, account.address))

    return useMemo(() => {
        if (!source) return !!(isLensLogin || currentFarcasterProfile?.profileId);

        switch (source) {
            case SocialPlatform.Lens:
                return !!isLensLogin;
            case SocialPlatform.Farcaster:
                return !!currentFarcasterProfile?.profileId;
            default:
                safeUnreachable(source);
                return false;
        }
    }, [isLensLogin, currentFarcasterProfile, source]);
}
