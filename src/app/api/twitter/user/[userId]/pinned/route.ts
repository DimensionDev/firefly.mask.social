import { NextRequest } from 'next/server.js';

import { MalformedError, NotFoundError } from '@/constants/error.js';
import { TWITTER_TIMELINE_OPTIONS } from '@/constants/twitter.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createTwitterErrorResponseJSON } from '@/helpers/createTwitterErrorResponse.js';
import { tweetV2ToPost } from '@/helpers/formatTwitterPost.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const userId = context?.params.userId;
        if (!userId) throw new MalformedError('userId not found');

        const client = await createTwitterClientV2(request);
        const user = await client.v2.user(userId, {
            'user.fields': ['pinned_tweet_id'],
            expansions: ['pinned_tweet_id'],
        });

        if (user.errors?.length) {
            console.error('[twitter] v2.user', user.errors);
            if (!user.data) return createTwitterErrorResponseJSON(user.errors);
        }

        if (!user.data.pinned_tweet_id) {
            throw new NotFoundError();
        }

        const {
            data,
            includes = {},
            errors,
        } = await client.v2.singleTweet(user.data.pinned_tweet_id, {
            ...TWITTER_TIMELINE_OPTIONS,
        });

        if (errors?.length) console.error('[twitter] v2.singleTweet (pinned tweet)', errors);

        return createSuccessResponseJSON(tweetV2ToPost(data, includes));
    },
);
