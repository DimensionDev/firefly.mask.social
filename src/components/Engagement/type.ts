import type { EngagementType, SocialPlatform } from '@/constants/enum.js';

export interface PostEngagementListProps {
    postId: string;
    type: EngagementType;
    source: SocialPlatform;
}
