import { getWindowSafe } from '@/helpers/bom.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export const getMeaningfulThemeMode = () => {
    const themeMode = useThemeModeStore.getState().themeMode;

    const win = getWindowSafe();
    if (!win) return themeMode;

    const isDarkOS = win.matchMedia('(prefers-color-scheme: dark)').matches;
    return themeMode === 'dark' || (themeMode === 'default' && isDarkOS) ? 'dark' : 'light';
};
