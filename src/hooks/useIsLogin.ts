import { useMemo } from 'react';

import { type SocialSource } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';

export function useIsLogin(source?: SocialSource | SocialSource[], strategy: 'some' | 'every' = 'some') {
    const currentProfileAll = useCurrentProfileAll();

    return useMemo(() => {
        const sources = !source ? SORTED_SOCIAL_SOURCES : Array.isArray(source) ? source : [source];
        return sources.length ? sources[strategy]((x) => !!currentProfileAll[x]?.profileId) : false;
    }, [source, strategy, currentProfileAll]);
}
