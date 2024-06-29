import { useMemo } from 'react';

import type { SocialSource } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';

export function useCurrentAvailableProfile(source?: SocialSource) {
    const all = useCurrentProfileAll();

    return useMemo(() => {
        if (source && all[source]) return all[source];

        const indexOfFirstAvailable = SORTED_SOCIAL_SOURCES.findIndex((x) => !!all[x]);
        return indexOfFirstAvailable === -1 ? null : all[SORTED_SOCIAL_SOURCES[indexOfFirstAvailable]];
    }, [source, all]);
}
