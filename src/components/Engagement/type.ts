import type { EngagementType, Source } from '@/constants/enum.js';

export interface PostEngagementListProps {
    postId: string;
    type: EngagementType;
    source: Source;
}
