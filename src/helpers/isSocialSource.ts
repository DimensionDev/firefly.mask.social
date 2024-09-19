import { type SocialSource, type SocialSourceInURL, SourceInURL } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function isSocialSource(source?: string): source is SocialSource {
    if (!source) return false;
    return SORTED_SOCIAL_SOURCES.includes(source as SocialSource);
}

export function isSocialSourceInURL(sourceInUrl?: string): sourceInUrl is SocialSourceInURL {
    if (!sourceInUrl) return false;
    return SORTED_SOCIAL_SOURCES.map(resolveSourceInURL).includes(sourceInUrl as SourceInURL);
}
