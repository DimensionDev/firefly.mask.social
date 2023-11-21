import { Appearance } from '@masknet/public-api';
import { MaskDarkTheme, MaskLightTheme, useSystemPreferencePalette } from '@masknet/theme';
import { useMaskThemeMode } from '@/hooks/useMaskThemeMode.js';
import type { Theme } from '@mui/material/styles';

export function useMaskTheme(): Theme {
    const mode = useMaskThemeMode();
    const systemMode = useSystemPreferencePalette();

    const computedMode = mode === Appearance.default ? systemMode : mode;

    if (computedMode === Appearance.dark) return MaskDarkTheme;
    return MaskLightTheme;
}
