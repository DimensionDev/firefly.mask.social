import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Account } from '@/types/index.js';

export interface FarcasterState {
    accounts: Account[];
    currentAccount: Account;
    updateCurrentAccount: (account: Account) => void;
    updateAccounts: (accounts: Account[]) => void;
    clearCurrentAccount: () => void;
    hydrateCurrentAccount: () => Account;
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
            },
            updateCurrentAccount: (account: Account) =>
                set((state) => {
                    state.currentAccount = account;
                }),
            updateAccounts: (accounts: Account[]) =>
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
