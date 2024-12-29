'use client';

import { I18nProvider } from '@lingui/react';
import { type PropsWithChildren } from 'react';

import { getI18nInstance } from '@/i18n/index.js';
import { bom } from '@/helpers/bom.js';
import { getLocaleFromCookiesAsync, useLocale } from '@/helpers/getFromCookies.js';

type LinguiClientProviderProps = PropsWithChildren<{}>;

export function LinguiClientProvider({ children }: LinguiClientProviderProps) {
    if (bom.document) {
        const locale = useLocale();
        return <I18nProvider i18n={getI18nInstance(locale)}>{children}</I18nProvider>;
    } else {
        const locale = getLocaleFromCookiesAsync();
        return locale.then((locale) => <I18nProvider i18n={getI18nInstance(locale)}>{children}</I18nProvider>);
    }
}
