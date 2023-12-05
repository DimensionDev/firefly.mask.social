import { MaskDarkTheme, MaskLightTheme } from '@masknet/theme';
import type { Theme } from '@mui/material/styles';

import { useDarkMode } from '@/hooks/useDarkMode.js';

export function useMaskTheme(): Theme {
    const { isDarkMode } = useDarkMode();

    return isDarkMode ? MaskDarkTheme : MaskLightTheme;
}
