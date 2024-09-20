import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';

/**
 * Returns the lenny avatar URL for the specified Lenny ID.
 * @param id The Lenny ID to get the URL for.
 * @returns The lenny avatar URL.
 */
export function getLennyUrl(id: string): string {
    return urlcat(SITE_URL, '/api/avatar', { id });
}
