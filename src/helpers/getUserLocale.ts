/**
 * Get user's locale for metadata
 *
 * @returns the user's locale or 'en-US' as default
 */
export function getUserLocale() {
    const locale = navigator?.languages?.length ? navigator.languages[0] : navigator.language;

    return locale ? locale.split('-')[0] : 'en';
}
