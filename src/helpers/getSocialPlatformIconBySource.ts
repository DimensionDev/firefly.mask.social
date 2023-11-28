import { SocialPlatform } from '@/constants/enum.js';

export function getSocialPlatformIconBySource(source: SocialPlatform, mode: 'light' | 'dark') {
    switch (source) {
        case SocialPlatform.Lens:
            return mode === 'light' ? '/svg/lens-light.svg' : '/svg/lens-dark.svg';
        case SocialPlatform.Farcaster:
            return '/svg/farcaster.svg';
        default:
            return '';
    }
}
