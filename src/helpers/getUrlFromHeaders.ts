import { headers } from 'next/headers.js';

import { parseURL } from '@/helpers/parseURL.js';

export function getUrlFromHeaders() {
    const url = headers().get('x-url');
    if (!url) return null;
    return parseURL(url);
}
