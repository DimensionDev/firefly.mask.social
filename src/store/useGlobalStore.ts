import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface GlobalState {
    currentSource: SocialPlatform;
    updateCurrentSource: (source: SocialPlatform) => void;
}

const useGlobalStateBase = create<GlobalState, [['zustand/immer', never]]>(
    immer((set) => ({
        currentSource: SocialPlatform.Lens,
        updateCurrentSource: (source: SocialPlatform) =>
            set((state) => {
                state.currentSource = source;
            }),
    })),
);

export const useGlobalState = createSelectors(useGlobalStateBase);
