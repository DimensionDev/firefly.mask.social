import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentSourceFromUrl } from '@/helpers/getCurrentSourceFromUrl.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

interface ProfileTabState {
    profileTab: FireflyIdentity;
    setProfileTab: (profileTab: FireflyIdentity) => void;
    reset: () => void;
}

const useProfileTabBase = create<ProfileTabState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            profileTab: {
                id: '',
                source: getCurrentSourceFromUrl(),
            },
            setProfileTab: (profileTab: FireflyIdentity) =>
                set((state) => {
                    state.profileTab = profileTab;
                }),
            reset: () => {
                set((state) => {
                    state.profileTab = {
                        id: '',
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
