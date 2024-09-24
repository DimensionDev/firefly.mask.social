import type { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';

import { HEY_API_URL, HEY_URL } from '@/constants/index.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

const impressionsEndpoint = urlcat(HEY_API_URL, '/leafwatch/impressions');

export async function POST(request: NextRequest) {
    const body = await request.json();
    await fetchJSON(impressionsEndpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        keepalive: true,
        headers: {
            'Content-Type': 'application/json',
            Referer: HEY_URL,
        },
        signal: request.signal,
    });

    return createSuccessResponseJSON({});
}
