import { i18n as coreI18n, type Messages, setupI18n } from '@lingui/core';
import { setI18n } from '@lingui/react/server';
import dayjs from 'dayjs';

import { Locale } from '@/constants/enum.js';
import { getLocaleFromCookiesAsync } from '@/helpers/getFromCookies.js';
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
        }),
    ]),
);

export const supportedLocales: Record<Locale, string> = {
    [Locale.en]: 'English',
    [Locale.zhHans]: '简体中文',
    [Locale.zhHant]: '繁體中文',
};

export const defaultLocale = Locale.en;

export async function setupLocaleForSSR() {
    const i18n = allLocales[await getLocaleFromCookiesAsync()];
    setI18n(i18n as any);
}

export function getI18nInstance(locale: Locale) {
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

    // lingui macro uses the core i18n
    coreI18n.loadAndActivate({
        locale,
        locales,
        messages: messages[locale],
    });
    dayjs.locale(locale);
}

export function getLocale(locale: Locale) {
    return messages[locale];
}
