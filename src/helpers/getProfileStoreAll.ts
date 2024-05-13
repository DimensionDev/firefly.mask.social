import { Source } from '@/constants/enum.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

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
