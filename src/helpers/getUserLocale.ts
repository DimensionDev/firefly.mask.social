import { getNavigatorSafe } from '@/helpers/bom.js';

/**
 * Get user's locale for metadata
 *
 * @returns the user's locale or 'en-US' as default
 */
export function getUserLocale() {
    const navigator = getNavigatorSafe();
    if (!navigator) return 'en';

    const locale = navigator.languages.length ? navigator.languages[0] : navigator.language;
    return locale ? locale.split('-')[0] : 'en';
}
