import { i18n as coreI18n, type Messages, setupI18n } from '@lingui/core';
import { setI18n } from '@lingui/react/server';
import dayjs from 'dayjs';

import { Locale } from '@/constants/enum.js';
import { getLocaleFromCookies } from '@/helpers/getFromCookies.js';
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
            messages,
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
    const i18n = allLocales[getLocaleFromCookies()];
    setI18n(i18n);
}

export function getI18n() {
    const locale = getLocaleFromCookies();
    return allLocales[locale];
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

    const i18n = allLocales[locale];
    i18n.load(locale, messages[locale]);
    i18n.activate(locale, locales);

    // lingui macro uses the core i18n
    coreI18n.load(locale, messages[locale]);
    coreI18n.activate(locale, locales);
    dayjs.locale(locale);
}

export function getLocale(locale: Locale) {
    return messages[locale];
}
