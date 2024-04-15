import { create } from 'zustand';
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
    currentSource: SocialPlatform;
    scrollIndexMap: Record<string, number>;
    setScrollIndex: (key: string, value: number) => void;
    updateCurrentSource: (source: SocialPlatform) => void;
}

const useGlobalStateBase = create<GlobalState, [['zustand/immer', never]]>(
    immer((set) => ({
        currentSource: getCurrentSource(),
        updateCurrentSource: (source: SocialPlatform) =>
            set((state) => {
                state.currentSource = source;
            }),
        scrollIndexMap: {},
        setScrollIndex: (key: string, value) => {
            set((state) => {
                state.scrollIndexMap[key] = value;
            });
        },
    })),
);

export const useGlobalState = createSelectors(useGlobalStateBase);
