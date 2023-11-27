import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';
import type { Account } from '@/types/index.js';

export interface FarcasterState {
    accounts: Account[];
    currentAccount?: Account;
    updateCurrentAccount: (account: Account | undefined) => void;
    updateAccounts: (accounts: Account[]) => void;
}

const useFarcasterStateBase = create<FarcasterState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer<FarcasterState>((set) => ({
            accounts: [],
            updateCurrentAccount: (account: Account | undefined) =>
                set((state) => {
                    state.currentAccount = account;
                }),
            updateAccounts: (accounts: Account[]) =>
                set((state) => {
                    state.accounts = accounts;
                }),
        })),
        { name: 'farcaster-state', partialize: (state) => ({ accounts: state.accounts }) },
    ),
);

export const useFarcasterStateStore = createSelectors(useFarcasterStateBase);
