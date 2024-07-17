import type { NextRequest } from 'next/server.js';

import type { KeyType } from '@/constants/enum.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import type { NextRequestContext } from '@/types/index.js';

export function withRequestRedisCache(key: KeyType) {
    return (handler: (request: NextRequest, context?: NextRequestContext) => Promise<Response>) => {
        const cachedHandler = memoizeWithRedis(handler, { key });
        return async (request: NextRequest, context?: NextRequestContext) => {
            return cachedHandler(request, context);
        };
    };
}
