import { useQuery } from '@tanstack/react-query';

import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

export function useActivityConnections() {
    const { data: authToken } = useFireflyBridgeAuthorization();
    return useQuery({
        queryKey: ['my-wallet-connections', authToken],
        async queryFn() {
            if (!fireflySessionHolder.session && !authToken) return;
            return FireflyActivityProvider.getAllConnections({ authToken });
        },
        refetchInterval: 600000,
    });
}
