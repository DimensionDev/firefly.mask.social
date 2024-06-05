import { uniq } from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface BlockedProfilesState {
    allBlockedProfiles: Record<string, string[]>;
    blockProfile(operator: Profile, profile: Profile): void;
    unblockProfile(operator: Profile, profile: Profile): void;
}

const useBlockedProfilesStore = create<
    BlockedProfilesState,
    [['zustand/persist', BlockedProfilesState], ['zustand/immer', never]]
>(
    persist(
        immer((set, get) => ({
            allBlockedProfiles: {},
            blockProfile: (operator: Profile, profile: Profile) => {
                set((state) => {
                    const key = `${operator.source}:${operator.profileId}`;
                    if (!state.allBlockedProfiles[key]) {
                        state.allBlockedProfiles[key] = [];
                    }
                    const prevList = get().allBlockedProfiles[key] || [];
                    state.allBlockedProfiles[key] = uniq([...prevList, profile.profileId]);
                });
            },
            unblockProfile: (operator: Profile, profile: Profile) => {
                set((state) => {
                    const key = `${operator.source}:${operator.profileId}`;
                    const prevList = get().allBlockedProfiles[key] || [];
                    state.allBlockedProfiles[key] = prevList.filter((id) => id !== profile.profileId);
                });
            },
        })),
        {
            name: 'firefly-blocked-profiles',
        },
    ),
);

export const useBlockedProfilesState = createSelectors(useBlockedProfilesStore);
