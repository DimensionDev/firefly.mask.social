import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

export const PUT = compose<(request: NextRequest, context: { params: { tweetId: string } }) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, { params: { tweetId } }) => {
        const client = await createTwitterClientV2(request);
        await client.v2.bookmark(tweetId);
        return createSuccessResponseJSON(true);
    },
);

export const DELETE = compose<(request: NextRequest, context: { params: { tweetId: string } }) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, { params: { tweetId } }) => {
        const client = await createTwitterClientV2(request);
        await client.v2.deleteBookmark(tweetId);
        return createSuccessResponseJSON(true);
    },
);
