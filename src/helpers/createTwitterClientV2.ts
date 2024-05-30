import type { NextRequest } from 'next/server.js';
import { TwitterApi } from 'twitter-api-v2';

import { UnauthorizedError } from '@/constants/error.js';
import { createTwitterSessionPayload } from '@/helpers/createTwitterSessionPayload.js';

export async function createTwitterClientV2(request: NextRequest) {
    const payload = await createTwitterSessionPayload(request);
    if (!payload) throw new UnauthorizedError();

    return new TwitterApi({
        appKey: payload.consumerKey,
        appSecret: payload.consumerSecret,
        accessToken: payload.accessToken,
        accessSecret: payload.accessTokenSecret,
    });
}
