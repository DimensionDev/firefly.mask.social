import urlcat from 'urlcat';

import type { SocialPlatform } from '@/constants/enum.js';

export function getPostUrl(id: string, source: SocialPlatform) {
    return urlcat(`/detail/:platform/:id`, { platform: source.toLowerCase(), id });
}
