import { headers } from 'next/headers.js';

import { parseURL } from '@/helpers/parseURL.js';

export function getUrlFromHeaders() {
    const url = headers().get('X-URL');
    if (!url) return null;
    return parseURL(url);
}
