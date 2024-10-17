import { useQuery } from '@tanstack/react-query';

import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';

export function useIsFollowingWallet(address: string, enabled = true) {
    return useQuery({
        enabled,
        queryKey: ['follow-wallet', address.toLowerCase()],
        queryFn: async () => FireflyEndpointProvider.isFollowingWallet(address),
    });
}
