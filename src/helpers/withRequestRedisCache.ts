import type { NextRequest } from 'next/server.js';

import type { KeyType } from '@/constants/enum.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import type { NextRequestContext } from '@/types/index.js';

type Handler = (request: NextRequest, context?: NextRequestContext) => Promise<Response>;

export function withRequestRedisCache(
    key: KeyType,
    {
        resolver,
    }: {
        resolver?: (...args: Parameters<Handler>) => string;
    } = {},
) {
    return (handler: Handler) => {
        const cachedHandler = memoizeWithRedis(handler, { key, resolver });
        return async (request: NextRequest, context?: NextRequestContext) => {
            return cachedHandler(request, context);
        };
    };
}
