import type { ProfilePageSource } from '@/constants/enum.js';
import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';

export function isProfilePageSource(source: string): source is ProfilePageSource {
    return SORTED_PROFILE_SOURCES.includes(source as ProfilePageSource);
}
