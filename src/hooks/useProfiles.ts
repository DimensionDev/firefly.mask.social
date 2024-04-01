import { SocialPlatform } from '@/constants/enum.js';
import { useProfilesAll } from '@/hooks/useProfilesAll.js';

export function useProfiles(source: SocialPlatform) {
    const profiles = useProfilesAll();
    return profiles[source];
}
