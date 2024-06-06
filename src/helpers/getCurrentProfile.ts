import { type SocialSource } from '@/constants/enum.js';
import { Source } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function getCurrentProfile(source: SocialSource) {
    return getCurrentProfileAll()[source];
}

export function getCurrentProfileAll(): Record<SocialSource, Profile | null> {
    const { currentProfile: currentLensProfile } = useLensStateStore.getState();
    const { currentProfile: currentFarcasterProfile } = useFarcasterStateStore.getState();
    const { currentProfile: currentTwitterProfile } = useTwitterStateStore.getState();

    return {
        [Source.Farcaster]: currentFarcasterProfile,
        [Source.Lens]: currentLensProfile,
        [Source.Twitter]: currentTwitterProfile,
    };
}
