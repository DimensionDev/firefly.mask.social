import type { ThemeSettings } from '@/providers/types/RedPacket.js';
import type { CSSProperties } from 'react';

/**
 * Get CSS font properties from theme settings
 * @param theme
 * @param type
 * @param elementType
 * @returns
 */
export function getCSSPropertiesFromThemeSettings(theme: ThemeSettings['title1']) {
    return {
        color: theme.color,
        fontSize: theme.font_size,
        fontWeight: theme.font_weight,
        lineHeight: `${theme.line_height}px`,
    } satisfies CSSProperties;
}
