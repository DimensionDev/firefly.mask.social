import { defaultLocale } from '@/i18n/index.js';
import type { Locale } from '@/types/index.js';
import { cookies } from 'next/headers.js';

export function getLocaleFromCookies() {
    const localeFromCookies = cookies().get('locale')?.value as Locale | undefined;
    return localeFromCookies ?? defaultLocale;
}
