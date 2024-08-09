import { type SocialSourceInURL, SourceInURL } from '@/constants/enum.js';

export function isSocialSourceInURL(source: SourceInURL): source is SocialSourceInURL {
    return [SourceInURL.Farcaster, SourceInURL.Lens, SourceInURL.Twitter].includes(source);
}
