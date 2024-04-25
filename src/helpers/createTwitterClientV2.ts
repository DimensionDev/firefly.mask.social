import type { NextRequest } from 'next/server.js';
import { getServerSession } from 'next-auth';
import { getToken, type JWT } from 'next-auth/jwt';
import { TwitterApi, type TwitterApiTokens } from 'twitter-api-v2';

import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';

export async function createTwitterClientV2(request: NextRequest) {
    const token: JWT = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });
    const session = await getServerSession(authOptions);

    if (!token || !session) throw new Error('Unauthorized');
    if (!token.twitter.oauthToken || !token.twitter.oauthTokenSecret) throw new Error('No Twitter token found');

    const tokens: TwitterApiTokens = {
        appKey: process.env.TWITTER_CLIENT_ID,
        appSecret: process.env.TWITTER_CLIENT_SECRET,
        accessToken: token.twitter.oauthToken,
        accessSecret: token.twitter.oauthTokenSecret,
    };
    return new TwitterApi(tokens);
}
