import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { TWITTER_TIMELINE_OPTIONS } from '@/constants/index.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { tweetV2ToPost } from '@/helpers/formatTwitterPost.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const DELETE = compose(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request: NextRequest, context?: NextRequestContext) => {
        const tweetId = context?.params.tweetId;
        if (!tweetId) throw new MalformedError('tweetId not found');

        const client = await createTwitterClientV2(request);
        const { data } = await client.v2.deleteTweet(tweetId);
        return createSuccessResponseJSON(data, { status: StatusCodes.OK });
    },
);

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const tweetId = context?.params.tweetId;
        if (!tweetId) throw new MalformedError('tweetId not found');

        const client = await createTwitterClientV2(request);
        const { data, includes } = await client.v2.singleTweet(tweetId, {
            ...TWITTER_TIMELINE_OPTIONS,
        });

        return createSuccessResponseJSON(tweetV2ToPost(data, includes));
    },
);
