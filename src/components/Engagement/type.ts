import type { EngagementType, SocialSource } from '@/constants/enum.js';

export interface PostEngagementListProps {
    postId: string;
    type: EngagementType;
    source: SocialSource;
}
