import { parseJSON } from '@masknet/web3-providers/helpers';
import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';
import type { createTweet, TwitterBody } from 'twitter-api-sdk/dist/types.js';
import { z } from 'zod';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';

const TweetSchema = z.object({
    text: z.string(),
    replaySettings: z.enum(['following', 'mentionedUsers']).optional(),
    inReplyToTweetId: z.string().optional(),
    mediaIds: z.array(z.string()).optional(),
});

async function composeTweet(rawTweet: string) {
    const parsedTweet = TweetSchema.safeParse(parseJSON(rawTweet));
    if (!parsedTweet.success) throw new Error(parsedTweet.error.message);

    const tweet = parsedTweet.success ? parsedTweet.data : null;
    if (!tweet) throw new Error('Invalid tweet data');

    const composedTweet: TwitterBody<createTweet> = {
        text: tweet.text,
    };

    if (tweet.mediaIds) {
        composedTweet.media = {
            media_ids: tweet.mediaIds,
        };
    }

    if (tweet.inReplyToTweetId) {
        composedTweet.reply = {
            in_reply_to_tweet_id: tweet.inReplyToTweetId,
        };
    }

    if (tweet.replaySettings) {
        composedTweet.reply_settings = tweet.replaySettings;
    }

    return composedTweet;
}

export async function POST(request: NextRequest) {
    try {
        const client = await createTwitterClientV2(request);

        const tweet = await composeTweet(await request.json());
        const { data } = await client.tweets.createTweet(tweet);

        return createSuccessResponseJSON(data, { status: StatusCodes.OK });
    } catch (error) {
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
