import { type SocialSource, Source } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function getProfilesAll(): Record<SocialSource, Profile[]> {
    const { accounts: lensAccounts } = useLensStateStore.getState();
    const { accounts: farcasterAccounts } = useFarcasterStateStore.getState();
    const { accounts: twitterAccounts } = useTwitterStateStore.getState();

    return {
        [Source.Farcaster]: lensAccounts.map((x) => x.profile),
        [Source.Lens]: farcasterAccounts.map((x) => x.profile),
        [Source.Twitter]: twitterAccounts.map((x) => x.profile),
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
            profiles: farcasterState.accounts.map((x) => x.profile),
            refreshAccounts: farcasterState.refreshAccounts,
            refreshCurrentAccount: farcasterState.refreshCurrentAccount,
            clear: farcasterState.clear,
        },
        [Source.Lens]: {
            currentProfile: lensState.currentProfile,
            currentProfileSession: lensState.currentProfileSession,
            profiles: lensState.accounts.map((x) => x.profile),
            refreshAccounts: lensState.refreshAccounts,
            refreshCurrentAccount: lensState.refreshCurrentAccount,
            clear: lensState.clear,
        },
        [Source.Twitter]: {
            currentProfile: twitterState.currentProfile,
            currentProfileSession: twitterState.currentProfileSession,
            profiles: twitterState.accounts.map((x) => x.profile),
            refreshAccounts: twitterState.refreshAccounts,
            refreshCurrentAccount: twitterState.refreshCurrentAccount,
            clear: twitterState.clear,
        },
    };
}
