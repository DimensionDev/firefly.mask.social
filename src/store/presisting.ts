import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LensAccount {
    profileId: string;
    avatar: string;
    name: string;
    isCurrent?: boolean;
}

export interface LensAccountsState {
    currentAccounts: LensAccount[];
    setAccounts: (accounts: LensAccount[]) => void;
}

const lensAccountsSlice: StateCreator<LensAccountsState, [['zustand/persist', unknown]]> = (set) => ({
    currentAccounts: [],
    setAccounts: (accounts: LensAccount[]) => set({ currentAccounts: accounts }),
});

export const useLensAccountsStore = create<LensAccountsState>()(persist(lensAccountsSlice, { name: 'lens-accounts' }));
