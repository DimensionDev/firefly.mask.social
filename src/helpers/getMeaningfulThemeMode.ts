import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export const getMeaningfulThemeMode = () => {
    const themeMode = useThemeModeStore.getState().themeMode;
    const isDarkOS = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return themeMode === 'dark' || (themeMode === 'default' && isDarkOS) ? 'dark' : 'light';
};
