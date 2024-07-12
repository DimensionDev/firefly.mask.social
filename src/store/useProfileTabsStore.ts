import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Source } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentSourceFromUrl } from '@/helpers/getCurrentSourceFromUrl.js';

interface ProfileTabState {
    currentProfileTabState: {
        source: Source;
        identity: string;
    };
    updateCurrentProfileState: (state: { source: Source; identity: string }) => void;
    reset: () => void;
}

const useProfileTabStateBase = create<ProfileTabState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            currentProfileTabState: {
                source: getCurrentSourceFromUrl(),
                identity: '',
            },
            updateCurrentProfileState: (profileState: { source: Source; identity: string }) =>
                set((state) => {
                    state.currentProfileTabState = profileState;
                }),
            reset: () => {
                set((state) => {
                    state.currentProfileTabState = {
                        source: getCurrentSourceFromUrl(),
                        identity: '',
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

export const useProfileTabState = createSelectors(useProfileTabStateBase);
