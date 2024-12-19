import type { Source } from '@/constants/enum.js';
import type { MentionChars } from '@/helpers/chars.js';
import { resolveSourceFromFireflyPlatform } from '@/helpers/resolveSource.js';

export function getProfileFromMention(mention: MentionChars, source: Source) {
    return mention.profiles.find((profile) => resolveSourceFromFireflyPlatform(profile.platform) === source);
}
