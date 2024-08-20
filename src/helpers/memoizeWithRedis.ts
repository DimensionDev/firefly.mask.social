/* cspell:disable */

import { kv } from '@vercel/kv';

import type { KeyType } from '@/constants/enum.js';

interface MemoizedFunction {
    cache: {
        get: (fieldKey: string) => Promise<string>;
        set: (fieldKey: string, fieldValue: string) => Promise<void>;
        has: (fieldKey: string) => Promise<boolean>;
        delete: (fieldKey: string) => Promise<boolean>;
    };
}

export function memoizeWithRedis<T extends (...args: any) => Promise<any>>(
    func: T,
    {
        key,
        resolver,
    }: {
        /** the name of KV store in redis */
        key: KeyType;
        /** the resolver returns the field key */
        resolver?: (...args: Parameters<T>) => string;
    },
): T & MemoizedFunction {
    const memoized = async (...args: any) => {
        const fieldKey = resolver ? resolver.apply(null, args) : [...args].join('_');

        try {
            const fieldExists = await kv.hexists(key, fieldKey);

            // Cache hit, return the cached value
            if (fieldExists) {
                const fieldValue = await kv.hget(key, fieldKey);
                return fieldValue;
            }
        } catch (error) {
            // Ignore
        }

        // Cache miss, call the original function
        const fieldValue = await func.apply(null, args);

        try {
            // Set the value in Redis
            await kv.hset(key, {
                [fieldKey]: fieldValue,
            });
        } catch (error) {
            // Ignore
        }

        return fieldValue;
    };

    memoized.cache = {
        get: async (fieldKey: string) => {
            const fieldValue = await kv.hget(key, fieldKey);
            const fieldValueWithTTL = fieldValue as { expiresAt: number; ttl: number; value: unknown };

            if (typeof fieldValueWithTTL.expiresAt === 'number' && typeof fieldValueWithTTL.ttl === 'number') {
                if (Date.now() >= fieldValueWithTTL.expiresAt) return null;
                else return fieldValueWithTTL.value;
            }
            // legacy field value
            return fieldValue;
        },
        set: async (fieldKey: string, value: unknown, ttl = 7 * 24 * 60 * 60 * 1000 /* a week */) => {
            await kv.hset(key, {
                [fieldKey]: {
                    expiresAt: Date.now() + ttl,
                    ttl,
                    value,
                },
            });
        },
        has: async (fieldKey: string) => (await kv.hexists(key, fieldKey)) === 1,
        delete: async (fieldKey: string) => (await kv.hdel(key, fieldKey)) === 1,
    };

    return memoized as unknown as T & MemoizedFunction;
}
