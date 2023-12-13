import { safeUnreachable } from '@masknet/kit';

import FarcasterIcon from '@/assets/farcaster.svg';
import LensIcon from '@/assets/lens.svg';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

interface SourceIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    source: SocialPlatform;
}

export function SourceIcon({ source, size = 20, className = '', ...props }: SourceIconProps) {
    switch (source) {
        case SocialPlatform.Lens:
            return (
                <LensIcon
                    {...props}
                    className={classNames(` h-[${size}px] w-[${size}px]`, className)}
                    width={size}
                    height={size}
                />
            );
        case SocialPlatform.Farcaster:
            return (
                <FarcasterIcon
                    {...props}
                    className={classNames(` h-[${size}px] w-[${size}px]`, className)}
                    width={size}
                    height={size}
                />
            );
        default:
            safeUnreachable(source);
            return null;
    }
}
