'use client';

import type { I18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type PropsWithChildren,useMemo } from 'react';

import { getI18n } from '@/i18n/index.js';

type LinguiClientProviderProps = PropsWithChildren<{}>;

export function LinguiClientProvider({ children }: LinguiClientProviderProps) {
    const i18n = getI18n() as unknown as I18n;
    return useMemo(() => {
        return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
    }, [i18n, children]);
}
