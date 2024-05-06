import { Source } from '@/constants/enum.js';
import { useProfileStoreAll } from '@/hooks/useProfileStoreAll.js';

export function useProfileStore(source: Source) {
    const all = useProfileStoreAll();
    return all[source];
}
