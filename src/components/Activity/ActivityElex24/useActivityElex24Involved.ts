import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import urlcat from 'urlcat';

import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { settings } from '@/settings/index.js';

export function useActivityElex24Involved() {
    const { name, address } = useContext(ActivityContext);
    const { data: authToken } = useFireflyBridgeAuthorization();
    return useQuery({
        enabled: !!address,
        queryKey: ['activity-involved', name, address, authToken],
        async queryFn() {
            if (name !== 'elex24') return false;
            const res = await fireflySessionHolder.fetch<{ data: { involved: boolean } }>(
                urlcat(settings.FIREFLY_ROOT_URL, `/v1/activity/check/:name/involved`, {
                    name,
                    address,
                }),
            );
            return res.data.involved;
        },
    });
}
