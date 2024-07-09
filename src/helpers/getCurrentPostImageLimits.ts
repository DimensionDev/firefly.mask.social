import { type SocialSource, Source } from '@/constants/enum.js';
import { MAX_IMAGE_SIZE_PER_POST } from '@/constants/index.js';
import type { ComposeType } from '@/types/compose.js';

export function getCurrentPostImageLimits(availableSources: SocialSource[], type: ComposeType) {
    if (availableSources.length === 0) return MAX_IMAGE_SIZE_PER_POST[Source.Farcaster];
    return Math.min(
        ...availableSources.map((source) => {
            const currentMax = MAX_IMAGE_SIZE_PER_POST[source];
            return source === Source.Farcaster && type === 'quote' ? currentMax - 1 : currentMax;
        }),
    );
}
