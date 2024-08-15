import { getEnumAsArray } from '@masknet/kit';
import { cookies } from 'next/headers.js';

import { Locale } from '@/constants/enum.js';
import { getDocumentSafe } from '@/helpers/bom.js';
import { getCookie } from '@/helpers/getCookie.js';
import { defaultLocale } from '@/i18n/index.js';

function resolveLocale(locale: string): Locale {
    return getEnumAsArray(Locale).find(({ value }) => value === locale)?.value ?? defaultLocale;
}

export function getLocaleFromCookies() {
    const locale = getDocumentSafe() ? getCookie('locale') : cookies().get('locale')?.value;
    return locale ? resolveLocale(locale) : defaultLocale;
}
