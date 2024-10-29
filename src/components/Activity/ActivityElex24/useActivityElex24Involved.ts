import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import urlcat from 'urlcat';
import { settings } from '@/settings/index.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';

export function useActivityElex24Involved() {
    const { name } = useContext(ActivityContext);
    const { data: authToken } = useFireflyBridgeAuthorization();
    return useQuery({
        queryKey: ['activity-involved', name, authToken],
        async queryFn() {
            if (name !== 'elex24') return false;
            const res = await fireflySessionHolder.fetch<{ data: { involved: boolean } }>(
                urlcat(settings.FIREFLY_ROOT_URL, `/v1/activity/check/elex24/involved`),
                {
                    ...(authToken
                        ? {
                              headers: {
                                  Authorization: `Bearer ${authToken}`,
                              },
                          }
                        : {}),
                },
            );
            return res.data.involved;
        },
    });
}
