import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Source } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentSourceFromUrl } from '@/helpers/getCurrentSourceFromUrl.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';

interface ProfileTabState {
    fireflyProfile: Omit<FireflyProfile, 'displayName' | '__origin__'>;
    updateFireflyProfile: (state: { source: Source; identity: string }) => void;
    reset: () => void;
}

const useProfileTabBase = create<ProfileTabState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            fireflyProfile: {
                source: getCurrentSourceFromUrl(),
                identity: '',
            },
            updateFireflyProfile: (profileState: { source: Source; identity: string }) =>
                set((state) => {
                    state.fireflyProfile = profileState;
                }),
            reset: () => {
                set((state) => {
                    state.fireflyProfile = {
                        source: getCurrentSourceFromUrl(),
                        identity: '',
                    };
                });
            },
        })),
        {
            name: 'profile-profile-state',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export const useProfileTabState = createSelectors(useProfileTabBase);
