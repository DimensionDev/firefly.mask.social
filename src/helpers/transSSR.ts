import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { getLocale } from '@/i18n/index.js';

export function transSSR(msgId: string) {
    const trans = getLocale(getLocaleFromCookies())[msgId] as string | undefined;
    return trans || msgId;
}
