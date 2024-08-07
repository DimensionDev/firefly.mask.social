import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Source } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentSourceFromUrl } from '@/helpers/getCurrentSourceFromUrl.js';

export interface ProfileTab {
    source: Source;
    identity?: string;
    isMyProfile?: boolean;
}

interface ProfileTabState {
    profileTab: ProfileTab;
    setProfileTab: (profileTab: ProfileTab) => void;
    reset: () => void;
}

const useProfileTabBase = create<ProfileTabState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            profileTab: {
                source: getCurrentSourceFromUrl(),
            },
            setProfileTab: (profileTab: ProfileTab) =>
                set((state) => {
                    state.profileTab = profileTab;
                }),
            reset: () => {
                set((state) => {
                    state.profileTab = {
                        source: getCurrentSourceFromUrl(),
                    };
                });
            },
        })),
        {
            name: 'profile-tab-state',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export const useProfileTabState = createSelectors(useProfileTabBase);
