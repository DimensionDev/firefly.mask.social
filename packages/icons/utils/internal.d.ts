import type { ComponentType } from 'react';

import { FireflyIconPalette } from './FireflyIconPaletteContext.js';

export interface __RawIcon__ {
    // currentVariant
    c?: string[];
    // URL
    u?: () => URL | null;
    // JSX
    j?: () => object;
    // supportColor
    s?: boolean;
}
export interface GeneratedIconProps<Variants extends FireflyIconPalette = never>
    extends GeneratedIconNonSquareProps<Variants> {
    size?: number;
}

export type GeneratedIcon = ComponentType<GeneratedIconProps> | ComponentType<GeneratedIconProps<'dark' | 'light'>>;

export interface GeneratedIconNonSquareProps<Variants extends FireflyIconPalette = never>
    extends React.HTMLProps<HTMLElement> {
    variant?: Variants[] | Variants;
    height?: number | string;
    width?: number | string;
    color?: string;
}
