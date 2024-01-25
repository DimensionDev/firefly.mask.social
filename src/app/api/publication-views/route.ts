import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

const STATS_URL = 'https://api.hey.xyz/stats/publication/views';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const response = await fetchJSON(STATS_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            Referer: 'https://hey.xyz',
        },
        signal: request.signal,
    });

    return createSuccessResponseJSON(response, { status: StatusCodes.OK });
}
