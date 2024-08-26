import type { NextRequest } from 'next/server.js';
import { z } from 'zod';

import { compose } from '@/helpers/compose.js';
import { createResponseJSON } from '@/helpers/createResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';

export const GET = compose<(request: NextRequest) => Promise<Response>>(withRequestErrorHandler(), async (request) => {
    const { url } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: z.string(),
        }),
    );
    const response = await fetchJSON(url);
    return createResponseJSON(response);
});

export const POST = compose<(request: NextRequest) => Promise<Response>>(withRequestErrorHandler(), async (request) => {
    const { url } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: z.string(),
        }),
    );
    const body = await request.json();
    const response = await fetchJSON(url, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return createResponseJSON(response);
});
