import type { ReadonlyURLSearchParams } from 'next/navigation.js';
import urlcat from 'urlcat';

import { SearchType } from '@/constants/enum.js';

export function resolveSearchUrl(options: Record<string, string | undefined>, params?: ReadonlyURLSearchParams) {
    return urlcat('/search/:type', {
        ...(params ? Object.fromEntries(params.entries()) : undefined),
        ...options,
        type: options.type || SearchType.Posts,
    });
}
