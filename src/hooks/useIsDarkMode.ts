import { useMediaQuery } from 'usehooks-ts';

import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export function useIsDarkMode() {
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');
    const themeMode = useThemeModeStore.use.themeMode();
    return themeMode === 'dark' || (themeMode === 'default' && isDarkOS);
}
