import { useMemo } from 'react';

import { getLocaleFromCookies } from '@/helpers/getFromCookies.js';

export function useLocale() {
    return useMemo(() => getLocaleFromCookies(), []);
}
