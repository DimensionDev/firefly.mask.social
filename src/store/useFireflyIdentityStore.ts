import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentSourceFromUrl } from '@/helpers/getCurrentSourceFromUrl.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

interface FireflyIdentityState {
    identity: FireflyIdentity;
    setIdentity: (profileIdentity: FireflyIdentity) => void;
    reset: () => void;
}

const useFireflyIdentityBase = create<FireflyIdentityState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            identity: {
                id: '',
                source: getCurrentSourceFromUrl(),
            },
            setIdentity: (profileIdentity: FireflyIdentity) =>
                set((state) => {
                    state.identity = profileIdentity;
                }),
            reset: () => {
                set((state) => {
                    state.identity = {
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

export const useFireflyIdentityState = createSelectors(useFireflyIdentityBase);
