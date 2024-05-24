import type { NextRequest } from 'next/server.js';
// import { getServerSession } from 'next-auth';
// import { getToken, type JWT } from 'next-auth/jwt';
import {
    TwitterApi,
    // type TwitterApiTokens
} from 'twitter-api-v2';
//
// import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';
// import { env } from '@/constants/env.js';

export async function createTwitterClientV2(request: NextRequest) {
    // const token: JWT = await getToken({
    //     req: request,
    //     secret: env.internal.NEXTAUTH_SECRET,
    // });
    // const session = await getServerSession(authOptions);
    //
    // if (!token || !session) throw new Error('Unauthorized');
    // if (!token.twitter.oauthToken || !token.twitter.oauthTokenSecret) throw new Error('No Twitter token found');
    //
    // const tokens: TwitterApiTokens = {
    //     appKey: env.internal.TWITTER_CLIENT_ID,
    //     appSecret: env.internal.TWITTER_CLIENT_SECRET,
    //     accessToken: token.twitter.oauthToken,
    //     accessSecret: token.twitter.oauthTokenSecret,
    // };
    const tokens = {
        appKey: 'SviLuBFkksUuIili8au5YTZYe',
        appSecret: 'PNviVkYJ7RObfb3jrNgZroCTNg9B3oNKtfxehHXAXPRyvbb9jD',
        accessToken: '1784776126839349248-fx3mgO63wpC9vLSRyZyg2NZKbyM7hS',
        accessSecret: 'ktI3hT6MW1VeSeoaaXgPumoiUmSD8vaybgWKbU45fYbwX',
    };
    return new TwitterApi(tokens);
}
