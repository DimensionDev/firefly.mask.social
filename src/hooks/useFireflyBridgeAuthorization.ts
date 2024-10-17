import { useQuery } from '@tanstack/react-query';

import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useFireflyBridgeAuthorization() {
    return useQuery({
        enabled: fireflyBridgeProvider.supported,
        queryKey: ['firefly-bridge-authorization'],
        queryFn() {
            return fireflyBridgeProvider.request(SupportedMethod.GET_AUTHORIZATION, {});
        },
    });
}
