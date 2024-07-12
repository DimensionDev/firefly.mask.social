import type { StateSnapshot } from 'react-virtuoso';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Source } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentSourceFromUrl } from '@/helpers/getCurrentSourceFromUrl.js';

interface GlobalState {
    routeChanged: boolean;
    collapsedConnectWallet: boolean;
    scrollIndex: Record<string, number>;
    setScrollIndex: (key: string, value: number) => void;
    virtuosoState: Record<'temporary' | 'cached', Record<string, StateSnapshot | undefined>>;
    setVirtuosoState: (key: 'temporary' | 'cached', listKey: string, snapshot: StateSnapshot) => void;
    currentSource: Source;
    updateCurrentSource: (source: Source) => void;
    currentProfileTabState: {
        source: Source;
        identity: string;
    };
    updateCurrentProfileState: (state: { source: Source; identity: string }) => void;
    updateCollapsedConnectWallet: (collapsed: boolean) => void;
}

const useGlobalStateBase = create<GlobalState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            routeChanged: false,
            collapsedConnectWallet: false,
            currentSource: getCurrentSourceFromUrl(),
            updateCurrentSource: (source: Source) =>
                set((state) => {
                    state.currentSource = source;
                }),
            currentProfileTabState: {
                source: getCurrentSourceFromUrl(),
                identity: '',
            },
            updateCurrentProfileState: (profileState: { source: Source; identity: string }) =>
                set((state) => {
                    state.currentProfileTabState = profileState;
                }),
            scrollIndex: {},
            setScrollIndex: (key: string, value) => {
                set((state) => {
                    state.scrollIndex[key] = value;
                    const temporarySnapshot = state.virtuosoState.temporary[key];
                    if (temporarySnapshot) {
                        state.virtuosoState.cached[key] = temporarySnapshot;
                        state.virtuosoState.temporary[key] = undefined;
                    }
                });
            },
            virtuosoState: {
                temporary: {},
                cached: {},
            },
            setVirtuosoState: (key, listKey, snapshot) => {
                set((state) => {
                    state.virtuosoState[key][listKey] = snapshot;
                });
            },
            updateCollapsedConnectWallet(collapsed) {
                set((state) => {
                    state.collapsedConnectWallet = collapsed;
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
