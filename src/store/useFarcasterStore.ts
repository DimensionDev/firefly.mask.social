import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { SocialMediaAccount } from '@/types/index.js';

export interface FarcasterState {
    accounts: SocialMediaAccount[];
    currentAccount: SocialMediaAccount;
    updateCurrentAccount: (account: SocialMediaAccount) => void;
    updateAccounts: (accounts: SocialMediaAccount[]) => void;
    clearCurrentAccount: () => void;
    hydrateCurrentAccount: () => SocialMediaAccount;
}

const useFarcasterStateBase = create<FarcasterState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer<FarcasterState>((set, get) => ({
            accounts: EMPTY_LIST,
            currentAccount: {
                profileId: '',
                avatar: '',
                name: '',
                id: '',
                platform: SocialPlatform.Farcaster,
            },
            updateCurrentAccount: (account: SocialMediaAccount) =>
                set((state) => {
                    state.currentAccount = account;
                }),
            updateAccounts: (accounts: SocialMediaAccount[]) =>
                set((state) => {
                    state.accounts = accounts;
                }),
            clearCurrentAccount: () =>
                set((state) => {
                    state.currentAccount = {
                        profileId: '',
                        avatar: '',
                        name: '',
                        id: '',
                        platform: SocialPlatform.Farcaster,
                    };
                }),
            hydrateCurrentAccount: () => {
                return get().currentAccount;
            },
        })),
        {
            name: 'farcaster-state',
            partialize: (state) => ({ accounts: state.accounts, currentAccount: state.currentAccount }),
        },
    ),
);

export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);

export const hydrateCurrentAccount = () => useFarcasterStateBase.getState().hydrateCurrentAccount();
