import { headers } from 'next/headers.js';

import { parseUrl } from '@/helpers/parseUrl.js';

export function getUrlFromHeaders() {
    const url = headers().get('X-URL');
    if (!url) return null;
    return parseUrl(url);
}
