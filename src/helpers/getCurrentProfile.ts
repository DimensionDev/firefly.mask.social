import { SocialPlatform } from '@/constants/enum.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';

export function getCurrentProfile(source: SocialPlatform) {
    return getCurrentProfileAll()[source];
}
