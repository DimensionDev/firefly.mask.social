import { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createTwitterErrorResponseJSON } from '@/helpers/createTwitterErrorResponse.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const PUT = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const tweetId = context?.params.tweetId;
        if (!tweetId) throw new MalformedError('tweetId not found');

        const client = await createTwitterClientV2(request);
        const { errors } = await client.v2.bookmark(tweetId);
        if (errors?.length) return createTwitterErrorResponseJSON(errors);

        return createSuccessResponseJSON(true);
    },
);

export const DELETE = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const tweetId = context?.params.tweetId;
        if (!tweetId) throw new MalformedError('tweetId not found');

        const client = await createTwitterClientV2(request);
        const { errors } = await client.v2.deleteBookmark(tweetId);
        if (errors?.length) return createTwitterErrorResponseJSON(errors);

        return createSuccessResponseJSON(true);
    },
);
