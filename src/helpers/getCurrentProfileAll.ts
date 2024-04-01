import { SocialPlatform } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function getCurrentProfileAll(): Record<SocialPlatform, Profile | null> {
    const { currentProfile: currentLensProfile } = useLensStateStore.getState();
    const { currentProfile: currentFarcasterProfile } = useFarcasterStateStore.getState();
    const { currentProfile: currentTwitterProfile } = useTwitterStateStore.getState();

    return {
        [SocialPlatform.Farcaster]: currentFarcasterProfile,
        [SocialPlatform.Lens]: currentLensProfile,
        [SocialPlatform.Twitter]: currentTwitterProfile,
    };
}
