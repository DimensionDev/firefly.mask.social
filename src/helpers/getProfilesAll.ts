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

export function getProfileStoreAll() {
    const lensState = useLensStateStore.getState();
    const farcasterState = useFarcasterStateStore.getState();
    const twitterState = useTwitterStateStore.getState();

    return {
        [Source.Farcaster]: {
            currentProfile: farcasterState.currentProfile,
            currentProfileSession: farcasterState.currentProfileSession,
            profiles: farcasterState.profiles,
            refreshProfiles: farcasterState.refreshProfiles,
            refreshCurrentProfile: farcasterState.refreshCurrentProfile,
            clear: farcasterState.clear,
        },
        [Source.Lens]: {
            currentProfile: lensState.currentProfile,
            currentProfileSession: lensState.currentProfileSession,
            profiles: lensState.profiles,
            refreshProfiles: lensState.refreshProfiles,
            refreshCurrentProfile: lensState.refreshCurrentProfile,
            clear: lensState.clear,
        },
        [Source.Twitter]: {
            currentProfile: twitterState.currentProfile,
            currentProfileSession: twitterState.currentProfileSession,
            profiles: twitterState.profiles,
            refreshProfiles: twitterState.refreshProfiles,
            refreshCurrentProfile: twitterState.refreshCurrentProfile,
            clear: twitterState.clear,
        },
    };
}
