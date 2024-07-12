import { useMemo } from 'react';

import { Source } from '@/constants/enum.js';
import { useMyAllProfiles } from '@/hooks/useMyAllProfiles.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useIsMyProfile(profile: Profile) {
    const profiles = useMyAllProfiles();

    return useMemo(() => {
        return profiles.some((x) => {
            if (profile.source !== x.source) return false;
            if (profile.source === Source.Lens) return x.identity === profile.handle;
            return x.identity === profile.profileId;
        });
    }, [profiles, profile]);
}
