import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Source, SourceInURL } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { resolveSource } from '@/helpers/resolveSource.js';

const getCurrentSource = () => {
    if (typeof document === 'undefined') return Source.Farcaster;
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source') as SourceInURL | null;
    if (!source) return Source.Farcaster;
    return resolveSource(source);
};

interface GlobalState {
    routeChanged: boolean;
    scrollIndex: Record<string, number>;
    setScrollIndex: (key: string, value: number) => void;
    currentSource: Source;
    updateCurrentSource: (source: Source) => void;
}

const useGlobalStateBase = create<GlobalState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            routeChanged: false,
            currentSource: getCurrentSource(),
            updateCurrentSource: (source: Source) =>
                set((state) => {
                    state.currentSource = source;
                }),
            scrollIndex: {},
            setScrollIndex: (key: string, value) => {
                set((state) => {
                    state.scrollIndex[key] = value;
                });
            },
        })),
        {
            name: 'global-state',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                routeChanged: state.routeChanged,
            }),
        },
    ),
);

export const useGlobalState = createSelectors(useGlobalStateBase);
