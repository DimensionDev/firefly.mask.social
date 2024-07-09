import { type SocialSource, Source } from '@/constants/enum.js';
import { MAX_IMAGE_SIZE_PER_POST } from '@/constants/index.js';
import type { ComposeType } from '@/types/compose.js';

export function getCurrentPostImageLimits(type: ComposeType, availableSources: SocialSource[]) {
    if (availableSources.length === 0) return MAX_IMAGE_SIZE_PER_POST[Source.Farcaster];
    return Math.min(
        ...availableSources.map((source) => {
            const max = MAX_IMAGE_SIZE_PER_POST[source];
            return source === Source.Farcaster && type === 'quote' ? max - 1 : max;
        }),
    );
}
