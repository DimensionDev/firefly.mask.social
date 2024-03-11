import { getEnumAsArray } from '@masknet/kit';
import { getCookie } from '@masknet/shared-base';
import { cookies } from 'next/headers.js';

import { defaultLocale } from '@/i18n/index.js';
import { Locale } from '@/types/index.js';

function resolveLocale(locale: string): Locale {
    return getEnumAsArray(Locale).some(({ value }) => value === locale) ? (locale as Locale) : defaultLocale;
}

export function getLocaleFromCookies() {
    const locale = typeof document === 'undefined' ? cookies().get('locale')?.value : getCookie('locale');
    return locale ? resolveLocale(locale) : defaultLocale;
}
