import { type SocialSource, Source } from '@/constants/enum.js';
import { DANGER_CHAR_LIMIT, MAX_CHAR_SIZE_PER_POST, SAFE_CHAR_LIMIT } from '@/constants/index.js';

export function getCurrentPostLimits(availableSources: SocialSource[]) {
    if (!availableSources.length)
        return {
            MAX_CHAR_SIZE_PER_POST: MAX_CHAR_SIZE_PER_POST[Source.Farcaster],
            DANGER_CHAR_LIMIT: DANGER_CHAR_LIMIT[Source.Farcaster],
            SAFE_CHAR_LIMIT: SAFE_CHAR_LIMIT[Source.Farcaster],
        };

    return {
        MAX_CHAR_SIZE_PER_POST: Math.min(...availableSources.map((x) => MAX_CHAR_SIZE_PER_POST[x])),
        DANGER_CHAR_LIMIT: Math.min(...availableSources.map((x) => DANGER_CHAR_LIMIT[x])),
        SAFE_CHAR_LIMIT: Math.min(...availableSources.map((x) => SAFE_CHAR_LIMIT[x])),
    };
}
