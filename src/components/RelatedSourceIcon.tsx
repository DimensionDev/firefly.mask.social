'use client';
import { safeUnreachable } from '@masknet/kit';
import { useDarkMode } from 'usehooks-ts';

import FarcasterIcon from '@/assets/farcaster.svg';
import LensIcon from '@/assets/lens.svg';
import XDarkIcon from '@/assets/x-circle-dark.svg';
import XLightIcon from '@/assets/x-circle-light.svg';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';
import { RelatedWalletSource } from '@/providers/types/Firefly.js';

interface RelatedSourceIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    source: RelatedWalletSource;
}

export function RelatedSourceIcon({ source, size = 20, ...props }: RelatedSourceIconProps) {
    const { isDarkMode } = useDarkMode();
    const style = useSizeStyle(size, props.style);

    switch (source) {
        case RelatedWalletSource.lens:
            return <LensIcon {...props} style={style} width={size} height={size} />;
        case RelatedWalletSource.farcaster:
            return <FarcasterIcon {...props} style={style} width={size} height={size} />;
        case RelatedWalletSource.twitter:
            return isDarkMode ? (
                <XDarkIcon {...props} style={style} width={size} height={size} />
            ) : (
                <XLightIcon {...props} style={style} width={size} height={size} />
            );
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
            return null;
        default:
            safeUnreachable(source);
            return null;
    }
}
