/* cspell:disable */
import { kv } from '@vercel/kv';

interface MemoizedFunction {
    cache: {
        get: (fieldKey: string) => Promise<string>;
        set: (fieldKey: string, fieldValue: string) => Promise<void>;
        has: (fieldKey: string) => Promise<boolean>;
        delete: (fieldKey: string) => Promise<boolean>;
    };
}

export function memoizeWithRedis<T extends (...args: any) => Promise<any>>(
    key: string,
    func: T,
    resolver?: (...args: Parameters<T>) => string,
): T & MemoizedFunction {
    const memoized = async (...args: any) => {
        const fieldKey = resolver ? resolver.apply(null, args) : [...args].join('_');

        try {
            const fieldExists = await kv.hexists(key, fieldKey);

            // Cache hit, return the cached value
            if (fieldExists) return kv.hget(key, fieldKey);
        } catch {
            // Ignore
        }

        // Cache miss, call the original function
        const fieldValue = await func.apply(null, args);

        try {
            // Set the value in Redis
            await kv.hset(key, {
                [fieldKey]: fieldValue,
            });
        } catch {
            // Ignore
        }

        return fieldValue;
    };

    memoized.cache = {
        get: async (fieldKey: string) => kv.hget(key, fieldKey),
        set: async (fieldKey: string, value: any) => {
            await kv.hset(key, {
                [fieldKey]: value,
            });
        },
        has: async (fieldKey: string) => (await kv.hexists(key, fieldKey)) === 1,
        delete: async (fieldKey: string) => (await kv.hdel(key, fieldKey)) === 1,
    };

    return memoized as unknown as T & MemoizedFunction;
}
