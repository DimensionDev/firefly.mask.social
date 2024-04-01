import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';

export function useIsMyProfile(source: SocialPlatform, handleOrProfileId: string) {
    const currentProfile = useCurrentProfile(source);

    return useMemo(() => {
        if (!currentProfile) return false;
        switch (currentProfile.source) {
            case SocialPlatform.Lens:
                return currentProfile.handle === handleOrProfileId;
            case SocialPlatform.Farcaster:
                return currentProfile.profileId === handleOrProfileId;
            case SocialPlatform.Twitter:
                return currentProfile.profileId === handleOrProfileId;
            default:
                safeUnreachable(currentProfile.source);
                return false;
        }
    }, [handleOrProfileId, currentProfile]);
}
