import { SocialPlatform } from '@/constants/enum.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

export function useCurrentProfile(source: SocialPlatform) {
    const all = useCurrentProfileAll();
    return all[source];
}
