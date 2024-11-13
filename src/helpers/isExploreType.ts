import type { ExploreType } from '@/constants/enum.js';
import { EXPLORE_TYPES } from '@/constants/index.js';

export function isExploreType(discover: string): discover is ExploreType {
    return EXPLORE_TYPES.includes(discover as ExploreType);
}
