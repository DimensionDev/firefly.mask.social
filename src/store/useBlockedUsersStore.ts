import { uniq } from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface BlockedUserState {
    allBlockedUsers: Record<string, string[]>;
    blockUser(operator: Profile, profile: Profile): void;
    unblockUser(operator: Profile, profile: Profile): void;
}

const useBlockedUsersStore = create<
    BlockedUserState,
    [['zustand/persist', BlockedUserState], ['zustand/immer', never]]
>(
    persist(
        immer((set, get) => ({
            allBlockedUsers: {},
            blockUser: (operator: Profile, profile: Profile) => {
                set((state) => {
                    const key = `${operator.source}:${operator.profileId}`;
                    if (!state.allBlockedUsers[key]) {
                        state.allBlockedUsers[key] = [];
                    }
                    const prevList = get().allBlockedUsers[key] || [];
                    state.allBlockedUsers[key] = uniq([...prevList, profile.profileId]);
                });
            },
            unblockUser: (operator: Profile, profile: Profile) => {
                set((state) => {
                    const key = `${operator.source}:${operator.profileId}`;
                    const prevList = get().allBlockedUsers[key] || [];
                    state.allBlockedUsers[key] = prevList.filter((id) => id !== profile.profileId);
                });
            },
        })),
        {
            name: 'firefly-blocked-users',
        },
    ),
);

export const useBlockedUsersState = createSelectors(useBlockedUsersStore);
