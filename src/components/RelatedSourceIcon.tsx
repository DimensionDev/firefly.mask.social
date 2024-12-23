'use client';
import { safeUnreachable } from '@masknet/kit';
import type { SVGProps } from 'react';

import FarcasterIcon from '@/assets/farcaster.svg';
import LensIcon from '@/assets/lens.svg';
import { XIcon } from '@/components/XIcon.js';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';
import { RelatedWalletSource } from '@/providers/types/Firefly.js';

interface RelatedSourceIconProps extends SVGProps<SVGSVGElement> {
    size?: number;
    source: RelatedWalletSource;
}

export function RelatedSourceIcon({ source, size = 20, ...props }: RelatedSourceIconProps) {
    const style = useSizeStyle(size, props.style);

    switch (source) {
        case RelatedWalletSource.lens:
            return <LensIcon {...props} style={style} width={size} height={size} />;
        case RelatedWalletSource.farcaster:
            return <FarcasterIcon {...props} style={style} width={size} height={size} />;
        case RelatedWalletSource.twitter:
            return <XIcon {...props} style={style} width={size} height={size} />;
        case RelatedWalletSource.cyber:
        case RelatedWalletSource.ethLeaderboard:
        case RelatedWalletSource.firefly:
        case RelatedWalletSource.hand_writing:
        case RelatedWalletSource.opensea:
        case RelatedWalletSource.other:
        case RelatedWalletSource.pfp:
        case RelatedWalletSource.rss3:
        case RelatedWalletSource.twitter_hexagon:
        case RelatedWalletSource.uniswap:
        case RelatedWalletSource.particle:
            return null;
        default:
            safeUnreachable(source);
            return null;
    }
}
