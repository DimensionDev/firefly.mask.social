import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { MAX_SEARCH_RECORD_SIZE } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface SearchHistoryState {
    records: string[];
    addRecord: (record: string) => void;
    removeRecord: (record: string) => void;
    clearAll: () => void;
}

const useSearchHistoryStateBase = create<
    SearchHistoryState,
    [['zustand/persist', unknown], ['zustand/immer', unknown]]
>(
    persist(
        immer((set) => ({
            records: [] as string[],
            addRecord: (record: string) =>
                set((state) => {
                    if (!record) return;
                    state.records = [...new Set([record, ...state.records])].slice(0, MAX_SEARCH_RECORD_SIZE);
                }),
            removeRecord: (record: string) =>
                set((state) => {
                    state.records = state.records.filter((x) => x !== record);
                }),
            clearAll: () =>
                set((state) => {
                    state.records = [];
                }),
        })),
        {
            name: 'search-history-state',
        },
    ),
);

export const useSearchHistoryStateStore = createSelectors(useSearchHistoryStateBase);
