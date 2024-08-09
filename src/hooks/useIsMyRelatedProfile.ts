import { useMemo } from 'react';

import type { Source } from '@/constants/enum.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';

export function useIsMyRelatedProfile(source: Source, id: string) {
    const profiles = useCurrentFireflyProfilesAll();

    return useMemo(
        () =>
            profiles.some((profile) =>
                isSameFireflyIdentity(profile.identity, {
                    id,
                    source,
                }),
            ),
        [profiles, source, id],
    );
}
