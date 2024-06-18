import { useQuery } from '@tanstack/react-query';

import { FireflyPlatform } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function useIsWalletMuted(address: string, enabled = true) {
    const addr = address.toLowerCase();
    return useQuery({
        enabled,
        queryKey: ['address-is-muted', addr],
        queryFn: () => {
            return FireflySocialMediaProvider.isProfileMuted(FireflyPlatform.Wallet, addr);
        },
    });
}
