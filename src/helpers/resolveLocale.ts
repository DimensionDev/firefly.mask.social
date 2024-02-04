import { getEnumAsArray } from '@masknet/kit';

import { defaultLocale } from '@/i18n/index.js';
import { Locale } from '@/types/index.js';

export function resolveLocale(locale?: string): Locale {
    if (!locale) return defaultLocale;
    return getEnumAsArray(Locale).some(({ value }) => value === locale) ? (locale as Locale) : defaultLocale;
}
