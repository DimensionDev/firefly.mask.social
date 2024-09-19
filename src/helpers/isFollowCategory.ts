import { FollowCategory } from '@/constants/enum.js';

export function isFollowCategory(category: string): category is FollowCategory {
    return [FollowCategory.Followers, FollowCategory.Mutuals, FollowCategory.Following].includes(
        category as FollowCategory,
    );
}
