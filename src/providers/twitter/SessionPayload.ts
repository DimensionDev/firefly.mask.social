/* cspell:disable */

import { kv } from '@vercel/kv';

import { KeyType } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { HIDDEN_SECRET } from '@/constants/index.js';

export interface SessionPayload {
    clientId: string;
    accessToken: string;
    accessTokenSecret: string;
    consumerKey: string;
    consumerSecret: string;
}

export class TwitterSessionPayload {
    static async recordPayload(payload: SessionPayload) {
        if (payload.consumerSecret === HIDDEN_SECRET) throw new Error('Cannot record hidden secret');
        if (payload.consumerSecret === env.internal.TWITTER_CLIENT_ID) throw new Error('Cannot record internal secret');

        // save the consumer secret to KV
        await kv.hsetnx(KeyType.ConsumerSecret, payload.consumerKey, payload.consumerSecret);

        return payload;
    }

    static async concealPayload(payload: SessionPayload) {
        if (payload.consumerSecret === HIDDEN_SECRET) return payload;

        // override the real consumer secret
        payload.consumerSecret = HIDDEN_SECRET;
        return payload;
    }

    static async revealPayload(payload: SessionPayload) {
        if (payload.consumerSecret !== HIDDEN_SECRET) return payload;

        if (payload.consumerKey === env.internal.TWITTER_CLIENT_ID) {
            payload.consumerSecret = env.internal.TWITTER_CLIENT_SECRET;
        } else {
            const secret = await kv.hget<string>(KeyType.ConsumerSecret, payload.consumerKey);
            if (!secret) throw new Error('Consumer secret not found');

            payload.consumerSecret = secret;
        }

        return payload;
    }
}
