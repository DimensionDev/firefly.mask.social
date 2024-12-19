import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useIsLoginInActivity } from '@/components/Activity/hooks/useIsLoginInActivity.js';
import { type SocialSource } from '@/constants/enum.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export function useActivityClaimCondition(source: SocialSource) {
    const { address, name, premiumAddress } = useContext(ActivityContext);
    const isLoggedIn = useIsLoginInActivity(source);
    return useQuery({
        queryKey: ['activity-claim-condition', address, name, isLoggedIn, premiumAddress],
        async queryFn() {
            return FireflyActivityProvider.getActivityClaimCondition(name, address, { premiumAddress });
        },
        enabled: isLoggedIn,
    });
}
