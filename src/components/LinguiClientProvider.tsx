'use client';

import type { I18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type PropsWithChildren } from 'react';

import type { Locale } from '@/constants/enum.js';
import { getI18n } from '@/i18n/index.js';

type LinguiClientProviderProps = PropsWithChildren<{
    local: Locale;
}>;

export function LinguiClientProvider({ local, children }: LinguiClientProviderProps) {
    const i18n = getI18n() as unknown as I18n;
    return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
