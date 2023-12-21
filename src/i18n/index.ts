import { i18n, type Messages } from '@lingui/core';
import dayjs from 'dayjs';

import { Locale } from '@/types/index.js';

// @ts-ignore
import { messages as en } from '../locales/en/messages.mjs';

const locales: Record<Locale, Messages> = {
    [Locale.en]: en,
};

export const supportedLocales: Record<Locale, string> = {
    [Locale.en]: 'English',
};

export const defaultLocale = Locale.en;

/**
 * set locale and dynamically import catalog
 * @param locale a supported locale string
 */
export async function setLocale(locale: Locale) {
    if (!supportedLocales.hasOwnProperty(locale)) {
        console.error(`[i18n]: unknown locale ${locale}`);
        locale = defaultLocale;
    } else {
        console.log(`[i18n]: locale ${locale}`);
    }
    i18n.load(locale, locales[locale]);
    i18n.activate(locale);
    dayjs.locale(locale);
}
