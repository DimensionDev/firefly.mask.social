import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export function useActivityClaimCondition() {
    const { address, name } = useContext(ActivityContext);
    const { data: authToken } = useFireflyBridgeAuthorization();
    const { data: isLoggedTwitter } = useIsLoginTwitterInActivity();
    return useQuery({
        queryKey: ['activity-claim-condition', address, authToken, name],
        async queryFn() {
            return FireflyActivityProvider.getActivityClaimCondition(name, { authToken, address: address ?? '0x' });
        },
        enabled: isLoggedTwitter,
    });
}