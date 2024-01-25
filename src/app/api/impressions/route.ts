import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

const impressionsEndpoint = 'https://api.hey.xyz/leafwatch/impressions';

export async function POST(request: NextRequest) {
    const body = await request.json();
    await fetchJSON(impressionsEndpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        keepalive: true,
        headers: {
            'Content-Type': 'application/json',
            Referer: 'https://hey.xyz',
        },
        signal: request.signal,
    });

    return createSuccessResponseJSON({}, { status: StatusCodes.OK });
}
