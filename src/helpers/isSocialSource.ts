import { type SocialSource, type SocialSourceInURL, Source, SourceInURL } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function isSocialSource(source?: Source): source is SocialSource {
    if (!source) return false;
    return SORTED_SOCIAL_SOURCES.includes(source as SocialSource);
}

export function isSocialSourceInURL(sourceInUrl?: SourceInURL): sourceInUrl is SocialSourceInURL {
    if (!sourceInUrl) return false;
    return SORTED_SOCIAL_SOURCES.map(resolveSourceInURL).includes(sourceInUrl);
}
