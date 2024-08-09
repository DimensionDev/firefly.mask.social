import { type SocialSource, Source } from '@/constants/enum.js';

export function isSocialSource(source: Source): source is SocialSource {
    return [Source.Farcaster, Source.Lens, Source.Twitter].includes(source);
}
