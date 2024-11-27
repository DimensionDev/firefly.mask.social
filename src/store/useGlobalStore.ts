import type { StateSnapshot } from 'react-virtuoso';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { AsyncStatus, type SocialSource, Source } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentSourceFromUrl } from '@/helpers/getCurrentSourceFromUrl.js';

interface GlobalState {
    routeChanged: boolean;

    asyncStatus: Record<SocialSource, AsyncStatus>;
    setAsyncStatus: (source: SocialSource, status: AsyncStatus) => void;

    scrollIndex: Record<string, number>;
    setScrollIndex: (key: string, value: number) => void;

    virtuosoState: Record<'temporary' | 'cached', Record<string, StateSnapshot | undefined>>;
    setVirtuosoState: (key: 'temporary' | 'cached', listKey: string, snapshot: StateSnapshot) => void;

    currentSource: Source;
    updateCurrentSource: (source: Source) => void;

    collapsedConnectWallet: boolean;
    updateCollapsedConnectWallet: (collapsed: boolean) => void;

    particleReconnecting: boolean;
    updateParticleReconnecting: (reconnecting: boolean) => void;

    web3StateAsyncStatus: AsyncStatus;
    setWeb3StateAsyncStatus: (status: AsyncStatus) => void;
}

const useGlobalStateBase = create<GlobalState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            routeChanged: false,

            asyncStatus: {
                [Source.Farcaster]: AsyncStatus.Idle,
                [Source.Lens]: AsyncStatus.Idle,
                [Source.Twitter]: AsyncStatus.Idle,
            },
            setAsyncStatus: (source: SocialSource, status: AsyncStatus) =>
                set((state) => {
                    state.asyncStatus[source] = status;
                }),

            currentSource: getCurrentSourceFromUrl(),
            updateCurrentSource: (source: Source) =>
                set((state) => {
                    state.currentSource = source;
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

            collapsedConnectWallet: false,
            updateCollapsedConnectWallet(collapsed) {
                set((state) => {
                    state.collapsedConnectWallet = collapsed;
                });
            },

            particleReconnecting: false,
            updateParticleReconnecting(reconnecting) {
                set((state) => {
                    state.particleReconnecting = reconnecting;
                });
            },

            web3StateAsyncStatus: AsyncStatus.Pending,
            setWeb3StateAsyncStatus(status) {
                set((state) => {
                    state.web3StateAsyncStatus = status;
                });
            },
        })),
        {
            name: 'global-state',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                routeChanged: state.routeChanged,
                particleReconnecting: state.particleReconnecting,
            }),
        },
    ),
);

export const useGlobalState = createSelectors(useGlobalStateBase);
