import { type DiscoverSource, type SocialDiscoverSource } from '@/constants/enum.js';
import { DISCOVER_SOURCES, SOCIAL_DISCOVER_SOURCE } from '@/constants/index.js';

export function isDiscoverSource(source: string): source is DiscoverSource {
    return DISCOVER_SOURCES.includes(source as SocialDiscoverSource);
}

export function isSocialDiscoverSource(source: string): source is SocialDiscoverSource {
    return SOCIAL_DISCOVER_SOURCE.includes(source as SocialDiscoverSource);
}
