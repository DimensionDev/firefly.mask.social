import { Source } from '@/constants/enum.js';
import { useProfilesAll } from '@/hooks/useProfilesAll.js';

export function useProfiles(source: Source) {
    const profiles = useProfilesAll();
    return profiles[source];
}
