import { useMemo } from 'react';

import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

export function useIsMyRelatedProfile(identity: FireflyIdentity) {
    const profiles = useCurrentFireflyProfilesAll();

    return useMemo(
        () => profiles.some((profile) => isSameFireflyIdentity(profile.identity, identity)),
        [profiles, identity],
    );
}
