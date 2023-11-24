'use client';
import { create } from 'zustand';

import { SocialPlatform } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';

interface GlobalState {
    currentSocialPlatform: SocialPlatform;
    switchSocialPlatform: (platform: SocialPlatform) => void;
    loginModalOpen: boolean,
    setLoginModalOpen: (open: boolean) => void
}

const useGlobalStateBase = create<GlobalState>()((set) => ({
    currentSocialPlatform: SocialPlatform.Lens,
    switchSocialPlatform: (platform: SocialPlatform) => set({ currentSocialPlatform: platform }),
    loginModalOpen: false,
    setLoginModalOpen: (open: boolean) => set({loginModalOpen: open})
}));

export const useGlobalState = createSelectors(useGlobalStateBase);
