import { EngagementType } from '@/constants/enum.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

function isEngagementType(value: string): value is EngagementType {
    return [EngagementType.Mirrors, EngagementType.Quotes, EngagementType.Likes, EngagementType.Recasts].includes(
        value as EngagementType,
    );
}

export function parseOldEngagementUrl(url: URL) {
    if (!url.pathname.startsWith('/post')) return null;
    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));
    if (!source || !isSocialSource(source)) return null;
    const [, , id, engagement] = url.pathname.split('/');
    if (!id) return null;
    if (!engagement || !isEngagementType(engagement)) return null;
    return { source, id, engagement };
}
