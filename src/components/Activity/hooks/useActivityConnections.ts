import { useQuery } from '@tanstack/react-query';

import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export function useActivityConnections() {
    const { data: isLoggedIn = false } = useIsLoginTwitterInActivity();
    const { data: authToken } = useFireflyBridgeAuthorization();
    return useQuery({
        enabled: isLoggedIn,
        queryKey: ['my-wallet-connections', authToken],
        async queryFn() {
            return FireflyActivityProvider.getAllConnections({ authToken });
        },
        refetchInterval: 600000,
    });
}
