import { NextRequest } from 'next/server.js';
import { type SendTweetV2Params } from 'twitter-api-v2';
import { z } from 'zod';

import { POLL_PEER_OPTION_MAX_CHARS } from '@/constants/poll.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createTwitterErrorResponseJSON } from '@/helpers/createTwitterErrorResponse.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

const TweetSchema = z.object({
    text: z.string(),
    replySettings: z.enum(['following', 'mentionedUsers']).optional(),
    excludeReplyProfileIds: z.array(z.string()).optional(),
    quoteTwitterId: z.string().optional(),
    inReplyToTweetId: z.string().optional(),
    mediaIds: z.array(z.string()).optional(),
    poll: z
        .object({
            options: z.array(
                z.object({
                    label: z
                        .string()
                        .max(
                            POLL_PEER_OPTION_MAX_CHARS,
                            `Poll option must be less than ${POLL_PEER_OPTION_MAX_CHARS} characters`,
                        ),
                }),
            ),
            durationSeconds: z.number().int().positive(),
        })
        .optional(),
});

async function composeTweet(rawTweet: unknown) {
    const parsedTweet = TweetSchema.safeParse(rawTweet);
    if (!parsedTweet.success) throw new Error(parsedTweet.error.message);

    const tweet = parsedTweet.success ? parsedTweet.data : null;
    if (!tweet?.text && !tweet?.mediaIds?.length) throw new Error('Tweet must contain text or media');

    const composedTweet: SendTweetV2Params = {
        text: tweet.text,
    };

    if (tweet.mediaIds?.length) {
        composedTweet.media = {
            // force skip type check
            media_ids: tweet.mediaIds as [string],
        };
    }

    if (tweet.inReplyToTweetId) {
        composedTweet.reply = {
            in_reply_to_tweet_id: tweet.inReplyToTweetId,
            exclude_reply_user_ids: tweet.excludeReplyProfileIds,
        };
    }

    if (tweet.replySettings) {
        composedTweet.reply_settings = tweet.replySettings;
    }

    if (tweet.quoteTwitterId) {
        composedTweet.quote_tweet_id = tweet.quoteTwitterId;
    }

    if (tweet.poll) {
        composedTweet.poll = {
            options: tweet.poll.options.map((option) => option.label),
            duration_minutes: Math.floor(tweet.poll.durationSeconds / 60),
        };
    }

    return composedTweet;
}

export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const client = await createTwitterClientV2(request);
        const tweet = await composeTweet(await request.json());
        const { data, errors } = await client.v2.tweet(tweet);
        if (errors?.length) {
            console.error('[twitter] v2.tweet', errors);
            return createTwitterErrorResponseJSON(errors);
        }

        return createSuccessResponseJSON(data);
    },
);
