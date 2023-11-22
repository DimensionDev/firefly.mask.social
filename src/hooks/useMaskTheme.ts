import { Appearance } from '@masknet/public-api';
import { MaskDarkTheme, MaskLightTheme, useSystemPreferencePalette } from '@masknet/theme';
import type { Theme } from '@mui/material/styles';

import { useMaskThemeMode } from '@/hooks/useMaskThemeMode.js';

export function useMaskTheme(): Theme {
    const mode = useMaskThemeMode();
    const systemMode = useSystemPreferencePalette();

    const computedMode = mode === Appearance.default ? systemMode : mode;

    if (computedMode === Appearance.dark) return MaskDarkTheme;
    return MaskLightTheme;
}
