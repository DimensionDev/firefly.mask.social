import { SocialPlatform } from '@/constants/enum.js';
import { useProfileStoreAll } from '@/hooks/useProfileStoreAll.js';

export function useProfileStore(source: SocialPlatform) {
    const all = useProfileStoreAll();
    return all[source];
}
