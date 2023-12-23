import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

const STATS_URL = 'https://api.hey.xyz/stats/publicationViews';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const response = await fetchJSON(STATS_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            Referer: 'https://hey.xyz',
        },
    });

    return createSuccessResponseJSON(response, { status: StatusCodes.OK });
}
