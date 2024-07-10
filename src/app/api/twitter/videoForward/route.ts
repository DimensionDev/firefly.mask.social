import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import { z } from 'zod';

import { MalformedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { parseURL } from '@/helpers/parseURL.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

const ForwardURL = z.object({
    url: z.string().url(),
});

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, ForwardURL);

        const parsed = parseURL(queryParams.url);
        if (!parsed) throw new MalformedError('url not found');

        return new Response(null, {
            status: StatusCodes.MOVED_PERMANENTLY,
            headers: {
                Location: parsed.href,
            },
        });
    },
);
