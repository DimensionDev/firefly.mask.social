import { SocialPlatform } from '@/constants/enum.js';

export function getCurrentPostImageLimits(availableSources: SocialPlatform[]) {
    return availableSources.includes(SocialPlatform.Farcaster) ? 2 : 4;
}
