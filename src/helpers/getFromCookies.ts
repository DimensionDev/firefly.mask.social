import { getEnumAsArray } from '@masknet/kit';
import { cookies } from 'next/headers.js';

import { Locale } from '@/constants/enum.js';
import { bom } from '@/helpers/bom.js';
import { getCookie } from '@/helpers/getCookie.js';
import { defaultLocale } from '@/i18n/index.js';

function resolveLocale(locale: string): Locale {
    return getEnumAsArray(Locale).find(({ value }) => value === locale)?.value ?? defaultLocale;
}

export function getFromCookies(key: string) {
    return bom.document ? getCookie(key) : cookies().get(key)?.value;
}

export function getLocaleFromCookies() {
    const locale = getFromCookies('locale');
    return locale ? resolveLocale(locale) : defaultLocale;
}
