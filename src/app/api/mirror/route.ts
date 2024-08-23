import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

const MIRROR_GRAPHQL_URL = 'https://mirror.xyz/api/graphql';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const response = await fetchJSON(MIRROR_GRAPHQL_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            Referer: 'https://mirror.xyz',
            origin: 'https://mirror.xyz',
        },
        signal: request.signal,
    });

    return createSuccessResponseJSON(response);
}
