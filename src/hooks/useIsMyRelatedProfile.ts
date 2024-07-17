import { useMemo } from 'react';

import { Source } from '@/constants/enum.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';

export function useIsMyRelatedProfile(identity: string, source: Source) {
    const profiles = useCurrentFireflyProfilesAll();

    return useMemo(
        () => profiles.some((profile) => profile.identity === identity && profile.source === source),
        [profiles, identity, source],
    );
}
