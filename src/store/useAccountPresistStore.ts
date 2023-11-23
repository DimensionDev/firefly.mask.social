import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSelectors } from '@/helpers/createSelector.js';

export interface LensAccount {
    profileId: string;
    avatar: string;
    name: string;
    id: string;
    isCurrent?: boolean;
}

export interface LensAccountsState {
    currentAccounts: LensAccount[];
    setAccounts: (accounts: LensAccount[]) => void;
}

const lensAccountsSlice: StateCreator<LensAccountsState, [['zustand/persist', unknown]]> = (set, get) => ({
    currentAccounts: [],
    setAccounts: (accounts: LensAccount[]) => set({ currentAccounts: accounts }),
});

export const useLensAccountsStoreBase = create<LensAccountsState>()(
    persist(lensAccountsSlice, { name: 'lens-accounts' }),
);
export const useLensAccountsStore = createSelectors(useLensAccountsStoreBase);

export interface FarcasterAccount {
    profileId: string;
    avatar: string;
    name: string;
    isCurrent?: boolean;
}

export interface FarcasterAccountsState {
    currentAccounts: FarcasterAccount[];
    setAccounts: (accounts: FarcasterAccount[]) => void;
}

const farcasterAccountsSlice: StateCreator<FarcasterAccountsState, [['zustand/persist', unknown]]> = (set, get) => ({
    currentAccounts: [],
    setAccounts: (accounts: FarcasterAccount[]) => set({ currentAccounts: accounts }),
});

export const useFarcasterAccountsStoreBase = create<FarcasterAccountsState>()(
    persist(farcasterAccountsSlice, { name: 'farcaster-accounts' }),
);
export const useFarcasterAccountsStore = createSelectors(useFarcasterAccountsStoreBase);
