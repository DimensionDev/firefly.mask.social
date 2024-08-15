import { bom } from '@/helpers/bom.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export const getMeaningfulThemeMode = () => {
    const themeMode = useThemeModeStore.getState().themeMode;
    if (!bom.window) return themeMode;

    const isDarkOS = bom.window.matchMedia('(prefers-color-scheme: dark)').matches;
    return themeMode === 'dark' || (themeMode === 'default' && isDarkOS) ? 'dark' : 'light';
};
