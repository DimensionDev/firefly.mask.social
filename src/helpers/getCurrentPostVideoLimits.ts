import { type SocialSource, Source } from '@/constants/enum.js';
import { MAX_VIDEO_SIZE_PER_POST } from '@/constants/index.js';
import type { ComposeType } from '@/types/compose.js';

export function getCurrentPostVideoLimits(type: ComposeType, availableSources: SocialSource[]) {
    if (availableSources.length === 0) return MAX_VIDEO_SIZE_PER_POST[Source.Twitter];

    return Math.min(...availableSources.map((source) => MAX_VIDEO_SIZE_PER_POST[source]));
}
