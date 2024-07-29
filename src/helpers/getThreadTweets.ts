import { TwitterApi } from 'twitter-api-v2';

import { TWITTER_TIMELINE_OPTIONS } from '@/constants/index.js';

async function getThreadTweetIds(client: TwitterApi, id: string, result = []): Promise<string[]> {
    const data = await client.v2.singleTweet(id, {
        expansions: ['referenced_tweets.id'],
    });
    const repliedTweetId = data.data?.referenced_tweets?.find((x) => x.type === 'replied_to')?.id;
    if (!repliedTweetId) return [...result, id];
    const repliedTweet = data.includes?.tweets?.find((x) => x.id === repliedTweetId);
    return [...result, id, ...(repliedTweet ? await getThreadTweetIds(client, repliedTweet.id) : [repliedTweetId])];
}

export async function getThreadTweets(client: TwitterApi, id: string) {
    const ids = await getThreadTweetIds(client, id);
    return await client.v2.tweets(ids, {
        ...TWITTER_TIMELINE_OPTIONS,
    });
}
