import { i18n, type Messages } from '@lingui/core';
import dayjs from 'dayjs';

import { IS_PREVIEW, IS_PRODUCTION, LS_LOCALE_KEY } from '@/constants/index.js';

const locales: Record<string, Messages> = {
    // @ts-ignore
    en: await import(`@/locales/en/messages.mjs`),
    // @ts-ignore
    pseudo: await import(`@/locales/pseudo/messages.mjs`),
};

export const supportedLocales: Record<string, string> = {
    en: 'English',
};

if (!IS_PRODUCTION || IS_PREVIEW) {
    supportedLocales.qaa = 'PseudoLanguage';
}

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
