import type { JWT } from 'next-auth/jwt';
import { Client } from 'twitter-api-sdk';

export function createTwitterClientV2(token: JWT) {
    if (!token.twitter.accessToken) throw new Error('No Twitter token found');
    return new Client(token.twitter.accessToken);
}
