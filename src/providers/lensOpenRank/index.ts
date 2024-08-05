import urlcat from 'urlcat';

import { env } from '@/constants/env.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { FeedPost } from '@/providers/lensOpenRank/types.js';

class OpenRank {
    feed(
        strategy: 'recent' | 'popular' | 'recommended' | 'crowdsourced',
        params?: {
            offset?: number;
            limit?: number;
        },
    ) {
        const url = urlcat(env.external.NEXT_PUBLIC_LENS_OPENRANK_URL, `/feed/${strategy}`, {
            ...params,
        });
        return fetchJSON<FeedPost[]>(url, {
            method: 'GET',
        });
    }
}

export const LensOpenRankProvider = new OpenRank();
