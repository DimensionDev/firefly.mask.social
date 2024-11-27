import type { CSSProperties } from 'react';

import type { FireflyRedPacketAPI } from '@/mask/bindings/index.js';

/**
 * Get CSS font properties from theme settings
 * @param theme
 * @param type
 * @param elementType
 * @returns
 */
export function getCSSPropertiesFromThemeSettings(theme: FireflyRedPacketAPI.ThemeSettings['title1']) {
    return {
        color: theme.color,
        fontSize: theme.font_size,
        fontWeight: theme.font_weight,
        lineHeight: `${theme.line_height}px`,
    } satisfies CSSProperties;
}
