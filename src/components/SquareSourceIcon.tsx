'use client';
import { safeUnreachable } from '@masknet/kit';
import type { SVGProps } from 'react';

import FarcasterIcon from '@/assets/farcaster-square.svg';
import LensIcon from '@/assets/lens-square.svg';
import FireflyIcon from '@/assets/logo.svg';
import WalletSquareDarkIcon from '@/assets/wallet-square-dark.svg';
import WalletSquareLightIcon from '@/assets/wallet-square-light.svg';
import XSquareDarkIcon from '@/assets/x-square-dark.svg';
import XSquareLightIcon from '@/assets/x-square-light.svg';
import { Source } from '@/constants/enum.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';

interface SquareSourceIconProps extends SVGProps<SVGSVGElement> {
    size?: number;
    source: Source;
    forceLight?: boolean;
}
export function SquareSourceIcon({ source, size = 20, forceLight, ...props }: SquareSourceIconProps) {
    const isDarkMode = useIsDarkMode();
    const style = useSizeStyle(size, props.style);

    switch (source) {
        case Source.Lens:
            return <LensIcon {...props} style={style} width={size} height={size} />;
        case Source.Farcaster:
            return <FarcasterIcon {...props} style={style} width={size} height={size} />;
        case Source.Wallet:
            return !isDarkMode || forceLight ? (
                <WalletSquareLightIcon {...props} style={style} width={size} height={size} />
            ) : (
                <WalletSquareDarkIcon {...props} style={style} width={size} height={size} />
            );
        case Source.Twitter:
            return !isDarkMode || forceLight ? (
                <XSquareLightIcon {...props} style={style} width={size} height={size} />
            ) : (
                <XSquareDarkIcon {...props} style={style} width={size} height={size} />
            );
        case Source.Firefly:
            return <FireflyIcon {...props} style={style} width={size} height={size} />;
        case Source.NFTs:
        case Source.Article:
        case Source.Snapshot:
        case Source.Polymarket:
        case Source.Telegram:
        case Source.Google:
        case Source.Apple:
            return null;
        default:
            safeUnreachable(source);
            return null;
    }
}
