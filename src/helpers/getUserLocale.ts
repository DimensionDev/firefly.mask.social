import { bom } from '@/helpers/bom.js';

/**
 * Get user's locale for metadata
 *
 * @returns the user's locale or 'en-US' as default
 */
export function getUserLocale() {
    if (!bom.navigator) return 'en';

    const locale = bom.navigator.languages.length ? bom.navigator.languages[0] : bom.navigator.language;
    return locale ? locale.split('-')[0] : 'en';
}
