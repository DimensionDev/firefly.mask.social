import {
    type ExploreSource,
    type SocialSource,
    type SocialSourceInURL,
    Source,
    SourceInURL,
} from '@/constants/enum.js';
import { SORTED_EXPLORE_SOURCES, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function isSocialSource(source?: Source): source is SocialSource {
    if (!source) return false;
    return SORTED_SOCIAL_SOURCES.includes(source as SocialSource);
}

export function isExploreSource(source?: Source): source is ExploreSource {
    if (!source) return false;
    return SORTED_EXPLORE_SOURCES.includes(source as ExploreSource);
}

export function isSocialSourceInUrl(sourceInUrl?: SourceInURL): sourceInUrl is SocialSourceInURL {
    if (!sourceInUrl) return false;
    return SORTED_SOCIAL_SOURCES.map(resolveSourceInUrl).includes(sourceInUrl);
}
