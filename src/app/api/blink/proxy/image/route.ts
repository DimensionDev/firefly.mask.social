import { z } from 'zod';

import { compose } from '@/helpers/compose.js';
import { createProxyImageResponse } from '@/helpers/createProxyImageResponse.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';

export const GET = compose(withRequestErrorHandler(), async (request) => {
    const { url } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: z.string(),
        }),
    );
    return createProxyImageResponse(url);
});
