import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { clearSessionStorageByPrefix } from '@/helpers/clearSessionStorageByPrefix.js';
import { createSelectors } from '@/helpers/createSelector.js';

const restore_scroll_prefix = 'rusted_labs_nextjs_scroll_restoration';
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
                // Clear all recorded scroll positions when switching source tabs
                clearSessionStorageByPrefix(restore_scroll_prefix);
            }),
    })),
);

export const useGlobalState = createSelectors(useGlobalStateBase);
