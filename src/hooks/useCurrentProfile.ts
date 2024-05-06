import { Source } from '@/constants/enum.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

export function useCurrentProfile(source: Source) {
    const all = useCurrentProfileAll();
    return all[source];
}
