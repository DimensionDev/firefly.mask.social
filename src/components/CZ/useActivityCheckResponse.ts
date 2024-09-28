import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect } from 'react';
import urlcat from 'urlcat';

import { ActivityContext } from '@/components/CZ/ActivityContext.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { CheckResponse } from '@/providers/types/CZ.js';
import { settings } from '@/settings/index.js';

export function useActivityCheckResponse() {
    const { address, isLoggedTwitter, authToken, type } = useContext(ActivityContext);
    const query = useQuery({
        queryKey: ['cz-activity-check', address, authToken],
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

    useEffect(() => {
        if (query.error) {
            enqueueErrorMessage(getSnackbarMessageFromError(query.error, t`Unknown error`));
        }
    }, [query.error]);

    return query;
}
