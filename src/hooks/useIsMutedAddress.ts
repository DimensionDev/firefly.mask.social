import { useQuery } from '@tanstack/react-query';

import { FireflyPlatform } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function useIsMutedAddress(address: string) {
    return useQuery({
        queryKey: ['wallet-is-muted', address],
        queryFn: () => {
            if (!address) return false;
            return FireflySocialMediaProvider.getIsMuted(FireflyPlatform.Wallet, address);
        },
    });
}
