import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';

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
