import { Client } from 'twitter-api-sdk';
import type { JWT } from 'next-auth/jwt';

export function createTwitterClientV2(token: JWT) {
    if (!token.twitter.accessToken) throw new Error('No Twitter token found');
    return new Client(token.twitter.accessToken);
}
