import { type SocialSource, Source } from '@/constants/enum.js';

export function isChannelSupported(source?: SocialSource) {
    if (!source) return false;
    return [Source.Farcaster, Source.Lens].includes(source);
}
