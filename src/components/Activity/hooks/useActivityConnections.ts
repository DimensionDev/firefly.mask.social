import { useQuery } from '@tanstack/react-query';

import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export function useActivityConnections() {
    const allProfiles = useCurrentProfileAll();
    return useQuery({
        queryKey: ['my-wallet-connections', allProfiles],
        async queryFn() {
            return FireflyActivityProvider.getAllConnections();
        },
        refetchInterval: 600000,
    });
}
