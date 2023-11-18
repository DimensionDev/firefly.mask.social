'use client';
import { SocialPlatform } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { create } from 'zustand';

interface GlobalState {
    currentSocialPlatform: SocialPlatform;
    switchSocialPlatform: (platform: SocialPlatform) => void;
}

const useGlobalStateBase = create<GlobalState>()((set) => ({
    currentSocialPlatform: SocialPlatform.Lens,
    switchSocialPlatform: (platform: SocialPlatform) => set({ currentSocialPlatform: platform }),
}));

export const useGlobalState = createSelectors(useGlobalStateBase);
