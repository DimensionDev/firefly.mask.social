'use client';
import { create } from 'zustand';

import { SocialPlatform } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface GlobalState {
    currentSocialPlatform: SocialPlatform;
    switchSocialPlatform: (platform: SocialPlatform) => void;
}

const useGlobalStateBase = create<GlobalState>()((set) => ({
    currentSocialPlatform: SocialPlatform.Lens,
    switchSocialPlatform: (platform: SocialPlatform) => set({ currentSocialPlatform: platform }),
}));

export const useGlobalState = createSelectors(useGlobalStateBase);
