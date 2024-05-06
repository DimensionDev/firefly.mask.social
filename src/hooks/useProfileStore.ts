import { type SocialSource } from '@/constants/enum.js';
import { useProfileStoreAll } from '@/hooks/useProfileStoreAll.js';

export function useProfileStore(source: SocialSource) {
    const all = useProfileStoreAll();
    return all[source];
}
