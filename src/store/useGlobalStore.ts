import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { clearSessionStorageByPrefix } from '@/helpers/clearSessionStorageByPrefix.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';

const RESTORE_SCROLL_PREFIX = 'rusted_labs_nextjs_scroll_restoration';

const getCurrentSource = () => {
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source') as SourceInURL | null;
    if (!source) return SocialPlatform.Farcaster;
    return resolveSocialPlatform(source) ?? SocialPlatform.Farcaster;
};

interface GlobalState {
    currentSource: SocialPlatform;
    updateCurrentSource: (source: SocialPlatform) => void;
}

const useGlobalStateBase = create<GlobalState, [['zustand/immer', never]]>(
    immer((set) => ({
        currentSource: getCurrentSource(),
        updateCurrentSource: (source: SocialPlatform) =>
            set((state) => {
                state.currentSource = source;
                // Clear all recorded scroll positions when switching source tabs
                clearSessionStorageByPrefix(RESTORE_SCROLL_PREFIX);
            }),
    })),
);

export const useGlobalState = createSelectors(useGlobalStateBase);
