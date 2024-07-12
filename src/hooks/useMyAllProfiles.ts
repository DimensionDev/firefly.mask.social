import { useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { Source } from '@/constants/enum.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { useCurrentFireflyProfileAll, useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function useMyAllProfiles(enabled = true) {
    const currentProfileAll = useCurrentProfileAll();
    const currentFireflyProfileAll = useCurrentFireflyProfileAll();

    const { data: profiles } = useQuery({
        enabled,
        queryKey: ['all-profiles', 'myself', currentProfileAll],
        queryFn: async () => {
            return FireflySocialMediaProvider.getAllPlatformProfiles(
                resolveProfileId(currentProfileAll[Source.Lens]),
                resolveProfileId(currentProfileAll[Source.Farcaster]),
                resolveProfileId(currentProfileAll[Source.Twitter]),
            );
        },
    });

    return useMemo(() => {
        if (!profiles) return currentFireflyProfileAll;
        // profile from currentProfileAll is always the first
        return uniqBy([...currentFireflyProfileAll, ...profiles], (x) => `${x.source}/${x.identity}`);
    }, [profiles, currentFireflyProfileAll]);
}
