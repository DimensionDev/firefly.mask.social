'use client';

import type { I18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useState } from 'react';

import { getI18n } from '@/i18n/index.js';

export function LinguiClientProvider({ children }: { children: React.ReactNode }) {
    const [i18n] = useState(() => {
        return getI18n() as unknown as I18n;
    });
    return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
