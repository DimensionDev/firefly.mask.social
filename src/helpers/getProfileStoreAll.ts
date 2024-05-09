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
            clearCurrentProfile: farcasterState.clearCurrentProfile,
            refreshProfiles: farcasterState.refreshProfiles,
            refreshCurrentProfile: farcasterState.refreshCurrentProfile,
        },
        [Source.Lens]: {
            currentProfile: lensState.currentProfile,
            currentProfileSession: lensState.currentProfileSession,
            profiles: lensState.profiles,
            clearCurrentProfile: lensState.clearCurrentProfile,
            refreshProfiles: lensState.refreshProfiles,
            refreshCurrentProfile: lensState.refreshCurrentProfile,
        },
        [Source.Twitter]: {
            currentProfile: twitterState.currentProfile,
            currentProfileSession: twitterState.currentProfileSession,
            profiles: twitterState.profiles,
            clearCurrentProfile: twitterState.clearCurrentProfile,
            refreshProfiles: twitterState.refreshProfiles,
            refreshCurrentProfile: twitterState.refreshCurrentProfile,
        },
    };
}
