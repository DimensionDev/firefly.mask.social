import { parseURL } from '@masknet/shared-base';
import { kv } from '@vercel/kv';
import type { NextRequest } from 'next/server.js';

import { KeyType, PageRoute } from '@/constants/enum.js';
import { compose } from '@/helpers/compose.js';
import { createErrorResponseJSON, createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { matchPath } from '@/helpers/matchPath.js';
import { resolveRedisFieldKey } from '@/helpers/memoizeWithRedis.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { HttpUrl } from '@/schemas/index.js';

function getOgCacheKey(url: string): { fieldKey: string; key: KeyType; result: Record<string, string> } | null {
    {
        const result = matchPath(PageRoute.Token, url);
        if (result) {
            return {
                key: KeyType.CreateMetadataToken,
                fieldKey: resolveRedisFieldKey(result.symbol),
                result,
            };
        }
    }
    {
        const result = matchPath(PageRoute.PostDetail, url);
        if (result) {
            return {
                key: KeyType.CreateMetadataPostById,
                fieldKey: resolveRedisFieldKey(result.source, result.id),
                result,
            };
        }
    }
    {
        const result = matchPath(PageRoute.Article, url);
        if (result) {
            return {
                key: KeyType.CreateMetadataArticleById,
                fieldKey: resolveRedisFieldKey(result.id),
                result,
            };
        }
    }
    {
        const result = matchPath(PageRoute.ProfileDetail, url);
        if (result) {
            return {
                key: KeyType.CreateMetadataProfileById,
                fieldKey: resolveRedisFieldKey(result.source, result.id),
                result,
            };
        }
    }
    {
        const result = matchPath(PageRoute.Event, url);
        if (result) {
            return {
                key: KeyType.CreateMetadataEvent,
                fieldKey: resolveRedisFieldKey(result.name),
                result,
            };
        }
    }
    return null;
}

export const DELETE = compose(withRequestErrorHandler(), async (request: NextRequest) => {
    const url = HttpUrl.parse(request.nextUrl.searchParams.get('url'));
    const path = parseURL(url)?.pathname;
    if (!path) return createErrorResponseJSON(`valid url: ${url}`);
    const result = getOgCacheKey(path);
    if (result) {
        await kv.hdel(result.key, result.fieldKey);
    }
    return createSuccessResponseJSON({});
});
