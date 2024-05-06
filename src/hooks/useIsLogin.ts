import { useMemo } from 'react';

import { Source } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

export function useIsLogin(source?: Source) {
    const currentProfileAll = useCurrentProfileAll();

    return useMemo(() => {
        if (source) return currentProfileAll[source]?.profileId;
        return SORTED_SOURCES.some((x) => !!currentProfileAll[x]?.profileId);
    }, [source, currentProfileAll]);
}
