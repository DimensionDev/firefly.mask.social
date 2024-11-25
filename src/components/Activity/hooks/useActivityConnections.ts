import { useQuery } from '@tanstack/react-query';

import { useIsLoginInActivity } from '@/components/Activity/hooks/useIsLoginInActivity.js';
import { Source } from '@/constants/enum.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export function useActivityConnections() {
    const isLoggedIn = useIsLoginInActivity(Source.Twitter);
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
