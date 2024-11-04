import { useQuery } from '@tanstack/react-query';

import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useFireflyBridgeAuthorization() {
    return useQuery({
        queryKey: ['firefly-bridge-authorization'],
        async queryFn() {
            if (!fireflyBridgeProvider.supported) return;
            return fireflyBridgeProvider.request(SupportedMethod.GET_AUTHORIZATION, {});
        },
        refetchInterval: (query) => {
            const count = query.state.dataUpdateCount || query.state.errorUpdateCount;
            if (query.state.data) return false;
            if (count > 5) return false;
            return 3000;
        },
    });
}
