import FarcasterIcon from '@/assets/farcaster.svg';
import LensDarkIcon from '@/assets/lens-dark.svg';
import LensLightIcon from '@/assets/lens-light.svg';
import { SocialPlatform } from '@/constants/enum.js';

export function getSocialPlatformIconBySource(source: SocialPlatform, isDark: boolean) {
    switch (source) {
        case SocialPlatform.Lens:
            return isDark ? LensDarkIcon : LensLightIcon;
        case SocialPlatform.Farcaster:
            return FarcasterIcon;
        default:
            return null;
    }
}
