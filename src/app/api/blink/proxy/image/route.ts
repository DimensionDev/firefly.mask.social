import { z } from 'zod';

import { compose } from '@/helpers/compose.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';

export const GET = compose(withRequestErrorHandler(), async (request) => {
    const { url } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: z.string(),
        }),
    );

    const response = await fetch(url);
    if (!response.ok) return createErrorResponseJSON('Unable to access the image', response);

    const headers = new Headers(response.headers);
    headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');

    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) headers.set('Cache-Control', cacheControl);

    return new Response(response.body, { headers });
});
