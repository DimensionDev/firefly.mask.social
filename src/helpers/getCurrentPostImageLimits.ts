import { type SocialSource, Source } from '@/constants/enum.js';

export function getCurrentPostImageLimits(availableSources: SocialSource[]) {
    return availableSources.includes(Source.Farcaster) ? 2 : 4;
}
