import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { CheckResponse } from '@/providers/types/Activity.js';
import { settings } from '@/settings/index.js';

export async function getActivityClaimCondition(
    name: string,
    address: string,
    options: {
        authToken?: string;
    } = {},
) {
    const { authToken } = options;
    const url = urlcat(settings.FIREFLY_ROOT_URL, `/v1/activity/check/:name`, { name, address });
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
}
