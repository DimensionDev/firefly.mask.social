import { type SocialSource, Source } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function getProfilesAll(): Record<SocialSource, Profile[]> {
    const { profiles: lensProfiles } = useLensStateStore.getState();
    const { profiles: farcasterProfiles } = useFarcasterStateStore.getState();
    const { profiles: twitterProfiles } = useTwitterStateStore.getState();

    return {
        [Source.Farcaster]: lensProfiles,
        [Source.Lens]: farcasterProfiles,
        [Source.Twitter]: twitterProfiles,
    };
}
