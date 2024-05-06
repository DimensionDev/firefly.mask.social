import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface PostState {
    allBlockedUsers: Record<string, string[]>;
    blockUser(operator: Profile, profile: Profile): void;
}

const usePostStore = create<PostState, [['zustand/persist', PostState], ['zustand/immer', never]]>(
    persist(
        immer((set) => ({
            allBlockedUsers: {},
            blockUser: (operator: Profile, profile: Profile) => {
                set((state) => {
                    const key = `${operator.source}:${operator.profileId}`;
                    if (!state.allBlockedUsers[key]) {
                        state.allBlockedUsers[key] = [];
                    }
                    state.allBlockedUsers[key].push(profile.profileId);
                });
            },
        })),
        {
            name: 'firefly-posts',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export const usePostState = createSelectors(usePostStore);
