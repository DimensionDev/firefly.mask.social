import { useQuery } from '@tanstack/react-query';

import { FireflyPlatform } from '@/constants/enum.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';

export function useIsWalletMuted(address: string, enabled = true) {
    const addr = address.toLowerCase();
    return useQuery({
        enabled,
        queryKey: ['address-is-muted', addr],
        queryFn: () => {
            return FireflyEndpointProvider.isProfileMuted(FireflyPlatform.Wallet, addr);
        },
    });
}
