import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';

export function useIsMyProfile(source: SocialSource, handleOrProfileId: string) {
    const currentProfile = useCurrentProfile(source);

    return useMemo(() => {
        if (!currentProfile) return false;
        switch (currentProfile.source) {
            case Source.Lens:
                return currentProfile.handle === handleOrProfileId;
            case Source.Farcaster:
                return currentProfile.profileId === handleOrProfileId;
            case Source.Twitter:
                return currentProfile.profileId === handleOrProfileId;
            default:
                safeUnreachable(currentProfile.source);
                return false;
        }
    }, [handleOrProfileId, currentProfile]);
}
