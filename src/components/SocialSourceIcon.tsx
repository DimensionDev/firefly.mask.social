'use client';

import type { FunctionComponent, SVGAttributes, SVGProps } from 'react';

import FarcasterIcon from '@/assets/farcaster.svg';
import FarcasterFillIcon from '@/assets/farcaster-fill.svg';
import LensIcon from '@/assets/lens.svg';
import LensFillIcon from '@/assets/lens-fill.svg';
import XFillIcon from '@/assets/x-fill.svg';
import { XIcon } from '@/components/XIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';

interface SocialSourceIconProps extends SVGProps<SVGSVGElement> {
    size?: number;
    source: SocialSource;
    /** Monochrome */
    mono?: boolean;
}

const ColorIconMap: Record<SocialSource, FunctionComponent<SVGAttributes<SVGElement>>> = {
    [Source.Lens]: LensIcon,
    [Source.Farcaster]: FarcasterIcon,
    [Source.Twitter]: XIcon,
};
const MonochromeIconMap: Record<SocialSource, FunctionComponent<SVGAttributes<SVGElement>>> = {
    [Source.Lens]: LensFillIcon,
    [Source.Farcaster]: FarcasterFillIcon,
    [Source.Twitter]: XFillIcon,
};

export function SocialSourceIcon({ source, size = 20, mono, ...props }: SocialSourceIconProps) {
    const style = useSizeStyle(size, props.style);
    const map = mono ? MonochromeIconMap : ColorIconMap;
    const Icon = map[source];

    if (!Icon) return null;
    return <Icon {...props} style={style} width={size} height={size} />;
}
