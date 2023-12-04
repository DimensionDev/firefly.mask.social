import { safeUnreachable } from '@masknet/kit';

import FarcasterIcon from '@/assets/farcaster.svg';
import LensIcon from '@/assets/lens.svg';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

interface PlatformIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    platform: SocialPlatform;
}

export function PlatformIcon({ platform, size = 20, className = '' }: PlatformIconProps) {
    switch (platform) {
        case SocialPlatform.Lens:
            return (
                <LensIcon
                    className={classNames(` h-[${size}px] w-[${size}px]`, className)}
                    width={size}
                    height={size}
                />
            );
        case SocialPlatform.Farcaster:
            return (
                <FarcasterIcon
                    className={classNames(` h-[${size}px] w-[${size}px]`, className)}
                    width={size}
                    height={size}
                />
            );
        default:
            safeUnreachable(platform);
            return null;
    }
}
