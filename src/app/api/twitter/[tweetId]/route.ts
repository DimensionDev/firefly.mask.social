import { compose } from '@masknet/shared-base';
import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';

import { TWITTER_TIMELINE_OPTIONS } from '@/constants/index.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

interface Params {
    tweetId: string;
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
    try {
        const client = await createTwitterClientV2(request);
        const tweetId = context.params.tweetId;
        const { data } = await client.v2.deleteTweet(tweetId);
        return createSuccessResponseJSON(data, { status: StatusCodes.OK });
    } catch (error) {
        console.log('[twitter]: twitter/[tweetId]/ error', error);
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}

export const GET = compose<(request: NextRequest, context: { params: { tweetId: string } }) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, { params: { tweetId } }) => {
        const client = await createTwitterClientV2(request);
        const { data } = await client.v2.singleTweet(tweetId, {
            ...TWITTER_TIMELINE_OPTIONS,
        });
        return createSuccessResponseJSON(data);
    },
);
