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

        console.log('DEBUG: fieldKey');
        console.log({
            key,
            fieldKey,
        });

        try {
            const fieldExists = await kv.hexists(key, fieldKey);

            // Cache hit, return the cached value
            if (fieldExists) {
                const fieldValue = await kv.hget(key, fieldKey);

                console.log('DEBUG: fieldValue - cache hit');
                console.log({
                    fieldKey,
                    fieldValue,
                });
            }
        } catch (error) {
            // Ignore
            console.log('DEBUG: cache hit error');
            console.log({
                error,
            });
        }

        // Cache miss, call the original function
        const fieldValue = await func.apply(null, args);

        console.log('DEBUG: fieldValue - cache miss');
        console.log({
            fieldKey,
            fieldValue,
        });

        try {
            // Set the value in Redis
            await kv.hset(key, {
                [fieldKey]: fieldValue,
            });
        } catch (error) {
            // Ignore
            console.log('DEBUG: cache miss error');
            console.log({
                error,
            });
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
