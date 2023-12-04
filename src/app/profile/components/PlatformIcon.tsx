import FarcasterIcon from '@/assets/farcaster.svg';
import LensIcon from '@/assets/lens.svg';
import { SocialPlatform } from '@/constants/enum.js';

interface PlatformIconProps {
    size?: number;
    platform: SocialPlatform;
}

export function PlatformIcon({ platform, size = 20 }: PlatformIconProps) {
    return platform === SocialPlatform.Lens ? (
        <LensIcon className={` h-${size} w-${size} rounded-full`} width={80} height={80} />
    ) : (
        <FarcasterIcon className={` h-${size} w-${size} rounded-full`} width={80} height={80} />
    );
}
