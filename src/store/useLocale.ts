import { useMemo } from 'react';

import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';

export function useLocale() {
    return useMemo(() => getLocaleFromCookies(), []);
}
