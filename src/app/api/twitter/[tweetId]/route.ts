import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { TWITTER_TIMELINE_OPTIONS } from '@/constants/index.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createTwitterErrorResponseJSON } from '@/helpers/createTwitterErrorResponse.js';
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
        const { data, errors } = await client.v2.deleteTweet(tweetId);

        if (errors?.length) {
            console.error('[twitter] v2.deleteTweet', errors);
            return createTwitterErrorResponseJSON(errors);
        }

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
        const {
            data,
            includes = {},
            errors,
        } = await client.v2.singleTweet(tweetId, {
            ...TWITTER_TIMELINE_OPTIONS,
        });
        if (errors?.length) console.error('[twitter] v2.singleTweet', errors);

        // The retweeted post may not receive attachment
        const retweeted = data.referenced_tweets?.find((tweet) => tweet.type === 'retweeted');
        if (retweeted) {
            const tweet = includes?.tweets?.find((x) => x.id === retweeted.id);
            if (tweet && !includes.media) {
                const result = await client.v2.singleTweet(tweet.id, {
                    expansions: ['attachments.media_keys'],
                    'media.fields': ['media_key', 'height', 'width', 'type', 'url', 'preview_image_url', 'variants'],
                });
                data.attachments = tweet?.attachments;
                data.note_tweet = tweet.note_tweet;
                data.text = tweet.text;
                if (result.includes?.media) includes.media = result.includes.media;
            }
        }

        return createSuccessResponseJSON(tweetV2ToPost(data, includes));
    },
);
