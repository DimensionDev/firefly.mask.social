import type { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createTwitterErrorResponseJSON } from '@/helpers/createTwitterErrorResponse.js';
import { tweetV2ToPost } from '@/helpers/formatTwitterPost.js';
import { getThreadTweets } from '@/helpers/getThreadTweets.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const tweetId = context?.params.tweetId;
        if (!tweetId) throw new MalformedError('tweetId not found');

        const client = await createTwitterClientV2(request);
        const { data, includes, errors } = await getThreadTweets(client, tweetId);
        if (errors?.length) {
            console.error('[twitter] v2.tweets', errors);
            return createTwitterErrorResponseJSON(errors);
        }

        return createSuccessResponseJSON(data.map((tweet) => tweetV2ToPost(tweet, includes)));
    },
);
