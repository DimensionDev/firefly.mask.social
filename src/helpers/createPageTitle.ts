import { SITE_NAME } from '@/constants/index.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { getLocale } from '@/i18n/index.js';

export function createPageTitle(title: string) {
    return `${title} • ${SITE_NAME}`;
}

export function createPageTitleSSR(msgId: string) {
    const title = getLocale(getLocaleFromCookies())[msgId] as string | undefined;
    return createPageTitle(title || msgId);
}

export function createPageTitleV2(title: string) {
    return `${title} in Firefly`;
}
