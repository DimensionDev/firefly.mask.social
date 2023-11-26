import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface GlobalState {
    currentSocialPlatform: SocialPlatform;
    switchSocialPlatform: (platform: SocialPlatform) => void;
}

const useGlobalStateBase = create<GlobalState, [['zustand/immer', never]]>(
    immer((set) => ({
        currentSocialPlatform: SocialPlatform.Lens,
        switchSocialPlatform: (platform: SocialPlatform) =>
            set((state) => {
                state.currentSocialPlatform = platform;
            }),
    })),
);

export const useGlobalState = createSelectors(useGlobalStateBase);
