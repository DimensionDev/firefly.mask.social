import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';
import { type SendTweetV2Params } from 'twitter-api-v2';
import { z } from 'zod';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';

const TweetSchema = z.object({
    text: z.string(),
    replySettings: z.enum(['following', 'mentionedUsers']).optional(),
    quoteTwitterId: z.string().optional(),
    inReplyToTweetId: z.string().optional(),
    mediaIds: z.array(z.string()).optional(),
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
            media_ids: tweet.mediaIds,
        };
    }

    if (tweet.inReplyToTweetId) {
        composedTweet.reply = {
            in_reply_to_tweet_id: tweet.inReplyToTweetId,
        };
    }

    if (tweet.replySettings) {
        composedTweet.reply_settings = tweet.replySettings;
    }

    if (tweet.quoteTwitterId) {
        composedTweet.quote_tweet_id = tweet.quoteTwitterId;
    }

    return composedTweet;
}

export async function POST(request: NextRequest) {
    try {
        const client = await createTwitterClientV2(request);
        const tweet = await composeTweet(await request.json());
        const { data } = await client.v2.tweet(tweet);
        console.error('[twitter]: compose/', data);
        return createSuccessResponseJSON(data, { status: StatusCodes.OK });
    } catch (error) {
        console.error('[twitter]: error compose/', error);
        return createErrorResponseJSON(`${error}`, {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
