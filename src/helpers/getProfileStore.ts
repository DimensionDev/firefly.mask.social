import type { SocialSource } from '@/constants/enum.js';
import { getProfileStoreAll } from '@/helpers/getProfileStoreAll.js';

export function getProfileStore(source: SocialSource) {
    return getProfileStoreAll()[source];
}
