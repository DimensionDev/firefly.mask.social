import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

export function useIsLogin(source?: SocialPlatform) {
    const currentProfileAll = useCurrentProfileAll();

    return useMemo(() => {
        if (source) return currentProfileAll[source]?.profileId;

        return !!(
            currentProfileAll.Farcaster?.profileId ||
            currentProfileAll.Lens?.profileId ||
            currentProfileAll.Twitter?.profileId
        );
    }, [source, currentProfileAll]);
}
