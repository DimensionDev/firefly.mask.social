import type { CSSProperties } from 'react';

import type { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

/**
 * Get CSS font properties from theme settings
 * @param settings
 * @param type
 * @param elementType
 * @returns
 */
export function getCSSPropertiesFromThemeSettings(settings: FireflyRedPacketAPI.ThemeSettings['title1']) {
    return {
        color: settings.color,
        fontSize: settings.font_size,
        fontWeight: settings.font_weight,
        lineHeight: `${settings.line_height}px`,
    } satisfies CSSProperties;
}
