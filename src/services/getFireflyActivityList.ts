import urlcat from 'urlcat';

import { EMPTY_LIST } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import type { ActivityListResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export async function getFireflyActivityList({ indicator, size }: { indicator?: PageIndicator; size?: number } = {}) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/activity/list', {
        cursor: indicator?.id,
        size,
    });
    const response = await fetchJSON<ActivityListResponse>(url);
    if (!response.data?.list) {
        return createPageable(EMPTY_LIST, createIndicator(indicator));
    }
    return createPageable(
        response.data.list,
        createIndicator(indicator),
        response.data.cursor ? createNextIndicator(indicator, `${response.data.cursor}`) : undefined,
    );
}
