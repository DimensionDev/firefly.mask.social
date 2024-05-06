import { type SocialSource } from '@/constants/enum.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

export function useCurrentProfile(source: SocialSource) {
    const all = useCurrentProfileAll();
    return all[source];
}
