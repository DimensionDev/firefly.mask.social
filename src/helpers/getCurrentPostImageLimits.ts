import { type SocialSource, Source } from '@/constants/enum.js';
import { MAX_IMAGE_SIZE_PER_POST } from '@/constants/index.js';

export function getCurrentPostImageLimits(availableSources: SocialSource[]) {
    if (availableSources.length === 0) return MAX_IMAGE_SIZE_PER_POST[Source.Farcaster];
    return Math.min(...availableSources.map((x) => MAX_IMAGE_SIZE_PER_POST[x]));
}
