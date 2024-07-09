import type { NextRequest } from 'next/server.js';
import { getToken, type JWT } from 'next-auth/jwt';

import { env } from '@/constants/env.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { TwitterSessionPayload } from '@/providers/twitter/SessionPayload.js';

async function createTwitterSessionPayloadFromHeaders(request: NextRequest) {
    const payload = TwitterSession.payloadFromHeaders(request.headers);
    if (!payload) return null;

    return TwitterSessionPayload.revealPayload(payload);
}

async function createTwitterSessionPayloadFromJWT(request: NextRequest) {
    const token: JWT | null = await getToken({
        req: request,
        secret: env.internal.NEXTAUTH_SECRET,
    });
    if (!token?.twitter.oauthToken || !token?.twitter.oauthTokenSecret) return null;

    return {
        clientId: token.twitter.oauthToken.split('-')[0],
        consumerKey: env.internal.TWITTER_CLIENT_ID,
        consumerSecret: env.internal.TWITTER_CLIENT_SECRET,
        accessToken: token.twitter.oauthToken,
        accessTokenSecret: token.twitter.oauthTokenSecret,
    };
}

export async function createTwitterSessionPayload(request: NextRequest) {
    const fromHeaders = await createTwitterSessionPayloadFromHeaders(request);
    if (fromHeaders) return fromHeaders;

    const fromJWT = await createTwitterSessionPayloadFromJWT(request);
    if (fromJWT) return fromJWT;

    return null;
}
