import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import type { CSSProperties } from 'react';

/**
 * Get CSS font properties from theme settings
 * @param theme 
 * @param type 
 * @param elementType 
 * @returns 
 */
export function getCSSPropertiesFromThemeSettings(
    theme: FireflyRedPacketAPI.ThemeGroupSettings,
    type: 'normal' | 'cover',
    elementType: `title${'1' | '2' | '3' | '4' | '_symbol'}`,
) {
    return {
        color: theme[type][elementType].color,
        fontSize: theme[type][elementType].font_size,
        fontWeight: theme[type][elementType].font_weight,
        lineHeight: `${theme[type][elementType].line_height}px`,
    } satisfies CSSProperties;
}
