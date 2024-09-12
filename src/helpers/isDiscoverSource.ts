import { type DiscoverSource, type SocialDiscoverSource, Source } from '@/constants/enum.js';
import { DISCOVER_SOURCE, SOCIAL_DISCOVER_SOURCE } from '@/constants/index.js';

export function isDiscoverSource(source: Source): source is DiscoverSource {
    return DISCOVER_SOURCE.includes(source as SocialDiscoverSource);
}

export function isSocialDiscoverSource(source: Source): source is SocialDiscoverSource {
    return SOCIAL_DISCOVER_SOURCE.includes(source as SocialDiscoverSource);
}
