import { compact } from 'lodash-es';
import { useMemo } from 'react';

import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useActiveProfiles() {
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();
    return useMemo(() => {
        return compact([currentFarcasterProfile, currentLensProfile, currentTwitterProfile]);
    }, [currentLensProfile, currentFarcasterProfile, currentTwitterProfile]);
}
