import { SITE_NAME } from '@/constants/index.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { setLocale } from '@/i18n/index.js';

export function createPageTitle(title: string) {
    setLocale(getLocaleFromCookies());
    return `${title} • ${SITE_NAME}`;
}
