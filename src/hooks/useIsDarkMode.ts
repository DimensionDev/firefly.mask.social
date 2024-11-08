import { isServer } from '@tanstack/react-query';
import { useMediaQuery } from 'usehooks-ts';

import { getFromCookies } from '@/helpers/getFromCookies.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export function useIsDarkMode() {
    const rootClass = getFromCookies('firefly_root_class');
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = useThemeModeStore.use.themeMode();
    return isServer ? rootClass === 'dark' : themeMode === 'dark' || (themeMode === 'default' && isDarkOS);
}
