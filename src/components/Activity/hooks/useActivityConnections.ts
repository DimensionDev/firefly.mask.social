import { useQuery } from '@tanstack/react-query';

import { useCurrentProfileFirstAvailable } from '@/hooks/useCurrentProfile.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export function useActivityConnections() {
    const currentProfileFirstAvailable = useCurrentProfileFirstAvailable();
    const { data: authToken } = useFireflyBridgeAuthorization();
    return useQuery({
        queryKey: ['my-wallet-connections', currentProfileFirstAvailable, authToken],
        async queryFn() {
            if (!fireflyBridgeProvider.supported && !currentProfileFirstAvailable) return; // Not logged in on the web
            return FireflyActivityProvider.getAllConnections();
        },
        refetchInterval: 600000,
    });
}
