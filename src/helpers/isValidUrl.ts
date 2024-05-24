import { URL_REGEX } from '@/constants/regexp.js';

export function isValidUrl(url?: string): url is string {
    if (!url) return false;
    URL_REGEX.lastIndex = 0;
    return URL_REGEX.test(url);
}
