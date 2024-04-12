import type { SocialPlatform } from '@/constants/enum.js';
import { DANGER_CHAR_LIMIT, MAX_CHAR_SIZE_PER_POST, SAFE_CHAR_LIMIT } from '@/constants/index.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function getCurrentPostLimits(source?: SocialPlatform) {
    const { posts } = useComposeStateStore.getState();
    const availableSources = source ? [source] : posts[0].availableSources;

    return {
        MAX_CHAR_SIZE_PER_POST: Math.min(...availableSources.map((x) => MAX_CHAR_SIZE_PER_POST[x])),
        DANGER_CHAR_LIMIT: Math.min(...availableSources.map((x) => DANGER_CHAR_LIMIT[x])),
        SAFE_CHAR_LIMIT: Math.min(...availableSources.map((x) => SAFE_CHAR_LIMIT[x])),
    };
}
