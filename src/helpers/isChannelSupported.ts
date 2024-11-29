import { type SocialSource, Source } from '@/constants/enum.js';

export function isChannelSupported(source?: SocialSource) {
    return source !== Source.Twitter;
}
