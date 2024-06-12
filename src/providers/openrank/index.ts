import urlcat from 'urlcat';

import { env } from '@/constants/env.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { TopProfile } from '@/providers/openrank/types.js';

class OpenRank {
    getTopProfiles(options?: { offset?: number; limit?: number }) {
        const url = urlcat(`${env.external.OPENRANK_URL}`, '/scores/global/engagement/rankings', {
            offset: options?.offset,
            limit: options?.limit,
        });
        return fetchJSON<{ result: TopProfile[] }>(url, {
            method: 'GET',
        });
    }
}

export const OpenRankProvider = new OpenRank();
