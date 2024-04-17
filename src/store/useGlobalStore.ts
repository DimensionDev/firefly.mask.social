import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';

const getCurrentSource = () => {
    if (typeof document === 'undefined') return SocialPlatform.Farcaster;
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source') as SourceInURL | null;
    if (!source) return SocialPlatform.Farcaster;
    return resolveSocialPlatform(source) ?? SocialPlatform.Farcaster;
};

interface GlobalState {
    routeChanged: boolean;
    scrollIndex: Record<string, number>;
    setScrollIndex: (key: string, value: number) => void;
    currentSource: SocialPlatform;
    updateCurrentSource: (source: SocialPlatform) => void;
}

const useGlobalStateBase = create<GlobalState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            routeChanged: false,
            currentSource: getCurrentSource(),
            updateCurrentSource: (source: SocialPlatform) =>
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
