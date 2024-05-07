import { type SocialSource } from '@/constants/enum.js';
import { useProfilesAll } from '@/hooks/useProfilesAll.js';

export function useProfiles(source: SocialSource) {
    const profiles = useProfilesAll();
    return profiles[source];
}
