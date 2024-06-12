'use client';
import { safeUnreachable } from '@masknet/kit';

import FarcasterIcon from '@/assets/farcaster.svg';
import LensIcon from '@/assets/lens.svg';
import XIcon from '@/assets/x.svg';
import { type SocialSource, Source } from '@/constants/enum.js';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';

interface SocialSourceIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    source: SocialSource;
}

export function SocialSourceIcon({ source, size = 20, ...props }: SocialSourceIconProps) {
    const style = useSizeStyle(size, props.style);

    switch (source) {
        case Source.Lens:
            return <LensIcon {...props} style={style} width={size} height={size} />;
        case Source.Farcaster:
            return <FarcasterIcon {...props} style={style} width={size} height={size} />;
        case Source.Twitter:
            return <XIcon {...props} style={style} width={size} height={size} />;
        default:
            safeUnreachable(source);
            return null;
    }
}
