import { type ProfileCategory, SocialProfileCategory, type SocialSource } from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE } from '@/constants/index.js';

export function isSocialProfileCategory(
    source: SocialSource,
    category: ProfileCategory,
): category is SocialProfileCategory {
    return SORTED_PROFILE_TAB_TYPE[source].includes(category as SocialProfileCategory);
}
