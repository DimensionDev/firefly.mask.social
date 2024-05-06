import { type SocialSource } from '@/constants/enum.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';

export function getCurrentProfile(source: SocialSource) {
    return getCurrentProfileAll()[source];
}
