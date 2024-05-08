import { uniq } from 'lodash-es';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';
import type { Channel, Profile } from '@/providers/types/SocialMedia.js';

interface BlockedChannelState {
    allBlockedChannels: Record<string, string[]>;
    changeMuteStatus(operator: Profile, target: Channel): void;
}

export const useBlockedChannelStore = create<
    BlockedChannelState,
    [['zustand/persist', BlockedChannelState], ['zustand/immer', never]]
>(
    persist(
        immer((set, get) => ({
            allBlockedChannels: {},
            changeMuteStatus: (operator: Profile, channel: Channel) => {
                set((state) => {
                    const key = `${operator.source}:${operator.profileId}`;
                    if (!state.allBlockedChannels[key]) {
                        state.allBlockedChannels[key] = [];
                    }
                    const prevList = get().allBlockedChannels[key] || [];

                    if (prevList.includes(channel.id)) {
                        state.allBlockedChannels[key] = prevList.filter((x) => x !== channel.id);
                    } else {
                        state.allBlockedChannels[key] = uniq([...prevList, channel.id]);
                    }
                });
            },
        })),
        {
            name: 'firefly-blocked-channel',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export const useBlockedChannelState = createSelectors(useBlockedChannelStore);
