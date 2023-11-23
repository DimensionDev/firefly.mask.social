import urlcat from 'urlcat';

import type { SocialPlatform } from '@/constants/enum.js';

export function getPostDetailUrl(id: string, source: SocialPlatform) {
    if (typeof window === 'undefined') return '';
    return urlcat(`${location.origin}/detail/:platform/:id`, { platform: source.toLowerCase(), id });
}
