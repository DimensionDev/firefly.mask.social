import { useEffect, useState } from 'react';
import { MaskMessages } from '@masknet/shared-base';
import { getThemeMode } from '@/helpers/themeMode.js';

export function useMaskThemeMode() {
    const [mode, setMode] = useState(getThemeMode);

    useEffect(() => MaskMessages.events.appearanceSettings.on((mode) => setMode(mode)), []);

    return mode;
}
