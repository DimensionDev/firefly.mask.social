import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentSourceFromUrl } from '@/helpers/getCurrentSourceFromUrl.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

interface ProfileIdentityState {
    profileIdentity: FireflyIdentity;
    setProfileIdentity: (profileIdentity: FireflyIdentity) => void;
    reset: () => void;
}

const useProfileIdentityBase = create<ProfileIdentityState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            profileIdentity: {
                id: '',
                source: getCurrentSourceFromUrl(),
            },
            setProfileIdentity: (profileIdentity: FireflyIdentity) =>
                set((state) => {
                    state.profileIdentity = profileIdentity;
                }),
            reset: () => {
                set((state) => {
                    state.profileIdentity = {
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

export const useProfileIdentityState = createSelectors(useProfileIdentityBase);
