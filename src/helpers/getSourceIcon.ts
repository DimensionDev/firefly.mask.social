import { SocialPlatform } from '@/constants/enum.js';

export function getSocialPlatformIconBySource(source: SocialPlatform, isDark: boolean) {
    switch (source) {
        case SocialPlatform.Lens:
            return !isDark ? '/svg/lens-light.svg' : '/svg/lens-dark.svg';
        case SocialPlatform.Farcaster:
            return '/svg/farcaster.svg';
        default:
            return '';
    }
}
