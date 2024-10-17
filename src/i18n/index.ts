import { i18n, type Messages, setupI18n } from '@lingui/core';
import { setI18n } from '@lingui/react/server';
import dayjs from 'dayjs';

import { Locale } from '@/constants/enum.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
// @ts-ignore
import { messages as en } from '@/locales/en/messages.mjs';
// @ts-ignore
import { messages as zhHans } from '@/locales/zh-Hans/messages.mjs';
// @ts-ignore
import { messages as zhHant } from '@/locales/zh-Hant/messages.mjs';

const messages: Record<Locale, Messages> = {
    [Locale.en]: en,
    [Locale.zhHans]: zhHans,
    [Locale.zhHant]: zhHant,
};

const locales = Object.keys(messages) as Locale[];

const allLocales = Object.fromEntries(
    locales.map((locale) => [
        locale,
        setupI18n({
            locale,
            locales,
            messages: {
                [locale]: messages[locale],
            },
        }) as unknown as Parameters<typeof setI18n>[0],
    ]),
);

export const supportedLocales: Record<Locale, string> = {
    [Locale.en]: 'English',
    [Locale.zhHans]: '简体中文',
    [Locale.zhHant]: '繁體中文',
};

export const defaultLocale = Locale.en;

export function setupLocaleForSSR() {
    setI18n(allLocales[getLocaleFromCookies()]);
}

/**
 * set locale and dynamically import catalog
 * @param locale a supported locale string
 */
export function setLocale(locale: Locale) {
    if (!supportedLocales.hasOwnProperty(locale)) {
        console.error(`[i18n]: unknown locale ${locale}`);
        locale = defaultLocale;
    } else {
        console.log(`[i18n]: locale ${locale}`);
    }

    i18n.load(locale, messages[locale]);
    i18n.activate(locale, locales);
    dayjs.locale(locale);
}

export function getLocale(locale: Locale) {
    return messages[locale];
}
