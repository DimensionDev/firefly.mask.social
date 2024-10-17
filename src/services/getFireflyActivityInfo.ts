import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import type { ActivityInfoResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export async function getFireflyActivityInfo(name: string) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/activity/info', {
        name,
    });
    const response = await fetchJSON<ActivityInfoResponse>(url);
    return resolveFireflyResponseData(response);
}
