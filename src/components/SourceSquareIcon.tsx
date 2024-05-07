'use client';
import { safeUnreachable } from '@masknet/kit';

import FarcasterIcon from '@/assets/farcaster-square.svg';
import LensIcon from '@/assets/lens-square.svg';
import WalletSquareDarkIcon from '@/assets/wallet-square-dark.svg';
import WalletSquareLightIcon from '@/assets/wallet-square-light.svg';
import XSquareDarkIcon from '@/assets/x-square-dark.svg';
import XSquareLightIcon from '@/assets/x-square-light.svg';
import { Source } from '@/constants/enum.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface SourceSquareIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    source: Source;
    forceLight?: boolean;
}
export function SourceSquareIcon({ source, size = 20, forceLight, ...props }: SourceSquareIconProps) {
    const { isDarkMode } = useDarkMode();
    const style = {
        width: size,
        height: size,
        ...props.style,
    };

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
        case Source.Article:
            return null;
        default:
            safeUnreachable(source);
            return null;
    }
}
