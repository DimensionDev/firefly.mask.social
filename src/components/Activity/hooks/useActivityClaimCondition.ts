import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import urlcat from 'urlcat';

import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { CheckResponse } from '@/providers/types/CZ.js';
import { settings } from '@/settings/index.js';

export function useActivityClaimCondition() {
    const { address } = useContext(ActivityContext);
    const { data: authToken } = useFireflyBridgeAuthorization();
    const { data: isLoggedTwitter } = useIsLoginTwitterInActivity();
    return useQuery({
        queryKey: ['activity-claim-condition', address, authToken],
        async queryFn() {
            // cspell: disable-next-line
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/misc/activity/checkBnbcz', {
                address: address!,
            });
            if (authToken) {
                const response = await fetchJSON<CheckResponse>(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                return response.data;
            }
            const response = await fireflySessionHolder.fetch<CheckResponse>(url);
            return response.data;
        },
        enabled: !!address && isLoggedTwitter,
    });
}
