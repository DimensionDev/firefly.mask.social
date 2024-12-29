import { SITE_NAME } from '@/constants/index.js';
import { getLocaleFromCookiesAsync } from '@/helpers/getFromCookies.js';
import { getLocale } from '@/i18n/index.js';

export function createPageTitle(title: string) {
    return `${title} • ${SITE_NAME}`;
}

export async function createPageTitleSSR(msgId: string) {
    const title = getLocale(await getLocaleFromCookiesAsync())[msgId] as string | undefined;
    return createPageTitle(title || msgId);
}

export function createPageTitleOG(title: string) {
    return `${title} in Firefly`;
}
