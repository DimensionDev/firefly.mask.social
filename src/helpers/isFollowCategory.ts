import { FollowCategory, type ProfileCategory } from '@/constants/enum.js';

export function isFollowCategory(category: ProfileCategory): category is FollowCategory {
    return [FollowCategory.Followers, FollowCategory.Mutuals, FollowCategory.Following].includes(
        category as FollowCategory,
    );
}
