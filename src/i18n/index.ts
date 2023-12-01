import { i18n, type Messages } from '@lingui/core';
import dayjs from 'dayjs';

import { LS_LOCALE_KEY } from '@/constants/index.js';

// @ts-ignore
import { messages as en } from '../locales/en/messages.mjs';

const locales: Record<string, Messages> = {
    en,
};

export const supportedLocales: Record<string, string> = {
    en: 'English',
};

const defaultLocale = 'en';

/**
 * set locale and dynamically import catalog
 * @param locale a supported locale string
 */
export async function setLocale(locale: string) {
    if (!supportedLocales.hasOwnProperty(locale)) {
        console.error('warning: unknown locale', locale);
        locale = defaultLocale;
    }
    localStorage.setItem(LS_LOCALE_KEY, JSON.stringify(locale));
    i18n.load(locale, locales[locale]);
    i18n.activate(locale);
    dayjs.locale(locale);
}

export function initLocale() {
    const storedValue = localStorage.getItem(LS_LOCALE_KEY);
    const locale = storedValue ? JSON.parse(storedValue) : defaultLocale;
    setLocale(locale);
}
