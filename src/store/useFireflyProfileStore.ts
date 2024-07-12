import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Source } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentSourceFromUrl } from '@/helpers/getCurrentSourceFromUrl.js';
import type { FireFlyProfile } from '@/providers/types/Firefly.js';

interface FireflyProfileState {
    fireflyProfile: Omit<FireFlyProfile, 'displayName' | '__origin__'>;
    updateFireflyProfile: (state: { source: Source; identity: string }) => void;
    reset: () => void;
}

const useFireflyProfileStateBase = create<
    FireflyProfileState,
    [['zustand/persist', unknown], ['zustand/immer', never]]
>(
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

export const useFireflyProfileState = createSelectors(useFireflyProfileStateBase);
