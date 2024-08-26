import { z } from 'zod';

import { compose } from '@/helpers/compose.js';
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
    if (!response.ok) {
        throw new Error('Failed to fetch image');
    }
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type');
    return new Response(
        buffer,
        contentType
            ? {
                  headers: { 'Content-Type': contentType },
              }
            : undefined,
    );
});
