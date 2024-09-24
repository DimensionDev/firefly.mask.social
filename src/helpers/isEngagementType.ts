import { EngagementType } from '@/constants/enum.js';

export function isEngagementType(value: string): value is EngagementType {
    return [EngagementType.Mirrors, EngagementType.Quotes, EngagementType.Likes, EngagementType.Recasts].includes(
        value as EngagementType,
    );
}
