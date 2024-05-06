import { Source } from '@/constants/enum.js';

export function getCurrentPostImageLimits(availableSources: Source[]) {
    return availableSources.includes(Source.Farcaster) ? 2 : 4;
}
