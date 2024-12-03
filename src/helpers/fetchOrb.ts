import urlcat from 'urlcat';

import { env } from '@/constants/env.js';
import { ORB_CLUB_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { NextFetchersOptions } from '@/helpers/getNextFetchers.js';

export function fetchOrb<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<T> {
    return fetchJSON(
        typeof input === 'string' && !input.startsWith('http') ? urlcat(ORB_CLUB_URL, input) : input,
        {
            ...init,
            headers: {
                ...init?.headers,
                'App-Access-Token': env.external.NEXT_PUBLIC_ORB_CLUB_API_TOKEN,
                'User-Agent': 'Bot',
            },
        },
        options,
    );
}
