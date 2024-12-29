import { getEnumAsArray } from '@masknet/kit';
import { cookies } from 'next/headers.js';

import { Locale } from '@/constants/enum.js';
import { bom } from '@/helpers/bom.js';
import { getDOMCookie } from '@/helpers/getCookie.js';
import { defaultLocale } from '@/i18n/index.js';
import { use } from 'react';

function resolveLocale(locale: string): Locale {
    return getEnumAsArray(Locale).find(({ value }) => value === locale)?.value ?? defaultLocale;
}

export function useCookie(key: string) {
    if (bom.document) return getDOMCookie(key);
    return use(cookies()).get(key)?.value;
}
async function getCookieAsync(key: string) {
    if (bom.document) return getDOMCookie(key);
    return (await cookies()).get(key)?.value;
}

export async function getLocaleFromCookiesAsync() {
    const locale = await getCookieAsync('locale');
    return locale ? resolveLocale(locale) : defaultLocale;
}
export function useLocale() {
    const cookie = useCookie('locale');
    return resolveLocale(cookie || defaultLocale);
}
