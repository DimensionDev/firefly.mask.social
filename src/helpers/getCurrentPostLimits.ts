
import { v4 as uuid } from 'uuid';

import { Source } from '@/constants/enum.js';
import { DANGER_CHAR_LIMIT, MAX_CHAR_SIZE_PER_POST, SAFE_CHAR_LIMIT } from '@/constants/index.js';
import { getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export function getCurrentPostLimits(post: CompositePost) {
    const { availableSources, poll } = post;
    if (!availableSources.length)
        return {
            MAX_CHAR_SIZE_PER_POST: MAX_CHAR_SIZE_PER_POST[Source.Farcaster],
            DANGER_CHAR_LIMIT: DANGER_CHAR_LIMIT[Source.Farcaster],
            SAFE_CHAR_LIMIT: SAFE_CHAR_LIMIT[Source.Farcaster],
        };

    const pollId = `${getPollFrameUrl(`poll-${uuid()}`, Source.Lens)}\n`;
    const lensMax = MAX_CHAR_SIZE_PER_POST[Source.Lens] - pollId.length;
    let perPostMax = Math.min(
        ...availableSources.map((x) => {
            if (poll && x === Source.Lens) return lensMax;
            return MAX_CHAR_SIZE_PER_POST[x];
        }),
    );

    if (poll && availableSources.includes(Source.Lens) && perPostMax < lensMax) {
        perPostMax += pollId.length;
    }

    return {
        MAX_CHAR_SIZE_PER_POST: perPostMax,
        DANGER_CHAR_LIMIT: Math.min(...availableSources.map((x) => DANGER_CHAR_LIMIT[x])),
        SAFE_CHAR_LIMIT: Math.min(...availableSources.map((x) => SAFE_CHAR_LIMIT[x])),
    };
}
