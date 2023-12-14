import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';

export function useIsMyProfile(source: SocialPlatform, profile: { identifier: string }): boolean;
export function useIsMyProfile(source: SocialPlatform, identifier: string): boolean;

export function useIsMyProfile(source: SocialPlatform, target: string | { identifier: string }): boolean {
    const identifier = typeof target === 'string' ? target : target.identifier;
    const currentProfile = useCurrentProfile(source);

    return useMemo(() => {
        if (!currentProfile) return false;
        switch (currentProfile.source) {
            case SocialPlatform.Lens:
                return currentProfile.handle === identifier;
            case SocialPlatform.Farcaster:
                return currentProfile.profileId === identifier;
            default:
                safeUnreachable(currentProfile.source);
                return false;
        }
    }, [identifier, currentProfile]);
}
