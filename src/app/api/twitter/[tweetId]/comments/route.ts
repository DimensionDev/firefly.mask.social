import type { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { TWITTER_TIMELINE_OPTIONS } from '@/constants/twitter.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { createAppOnlyTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import { Pageable } from '@/schemas/index.js';
import type { NextRequestContext } from '@/types/index.js';

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const tweetId = context?.params.tweetId;
        if (!tweetId) throw new MalformedError('tweetId not found');

        const queryParams = getSearchParamsFromRequestWithZodObject(request, Pageable);

        const client = await createAppOnlyTwitterClientV2(request);
        const { data, errors } = await client.v2.searchAll(`conversation_id:${tweetId} -is:retweet`, {
            ...TWITTER_TIMELINE_OPTIONS,
            next_token: queryParams.cursor ? queryParams.cursor : undefined,
            max_results: queryParams.limit,
        });
        if (errors?.length) console.error('[twitter] v2.search', errors);

        return createSuccessResponseJSON({
            ...data,
            data:
                data?.data?.filter((item) =>
                    item.referenced_tweets?.some((tweet) => tweet.type === 'replied_to' && tweet.id === tweetId),
                ) || EMPTY_LIST,
        });
    },
);
