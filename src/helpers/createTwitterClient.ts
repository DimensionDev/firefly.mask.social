import Twitter from 'twitter-lite';
import { JWT } from 'next-auth/jwt';

export function createTwitterClient(token: JWT) {
    console.log('DEBUG: token');
    console.log(token['twitter']);

    if (!token.twitter) throw new Error('No Twitter token found');

    return new Twitter({
        subdomain: 'api',
        consumer_key: process.env.TWITTER_CLIENT_ID,
        consumer_secret: process.env.TWITTER_CLIENT_SECRET,
        access_token_key: token.twitter.accessToken,
        access_token_secret: token.twitter.refreshToken,
    });
}
