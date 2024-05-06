import { useMemo } from 'react';

import type { Source } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

export function useCurrentAvailableProfile(source?: Source) {
    const all = useCurrentProfileAll();

    return useMemo(() => {
        if (source && all[source]) return all[source];

        const indexOfFirstAvailable = SORTED_SOURCES.findIndex((x) => !!all[x]);
        return indexOfFirstAvailable === -1 ? null : all[SORTED_SOURCES[indexOfFirstAvailable]];
    }, [source, all]);
}
