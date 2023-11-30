import { type Appearance } from '@masknet/public-api';
import { useSystemPreferencePalette } from '@masknet/theme';
import { useCallback } from 'react';

import { setThemeMode } from '@/helpers/themeMode.js';

export function useSetThemeMode() {
    const systemMode = useSystemPreferencePalette();
    return useCallback((mode: Appearance) => setThemeMode(mode, systemMode), [systemMode]);
}
