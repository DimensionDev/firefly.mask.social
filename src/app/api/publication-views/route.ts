import { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';

import { HEY_API_URL, HEY_URL } from '@/constants/index.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

const STATS_URL = urlcat(HEY_API_URL, '/stats/publication/views');

export async function POST(request: NextRequest) {
    const body = await request.json();
    const response = await fetchJSON(STATS_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            Referer: HEY_URL,
        },
        signal: request.signal,
    });

    return createSuccessResponseJSON(response);
}
