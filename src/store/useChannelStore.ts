import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { type SocialSource, Source } from '@/constants/enum.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface ChannelState {
    allChannelData: Record<SocialSource, Record<string, Channel | null>>;
    addChannel: (source: SocialSource, key: string, channel: Channel | null) => void;
}

const useChannelStore = create<ChannelState, [['zustand/persist', ChannelState], ['zustand/immer', never]]>(
    persist(
        immer((set, get) => ({
            allChannelData: {
                [Source.Farcaster]: {},
                [Source.Lens]: {},
                [Source.Twitter]: {},
            },
            addChannel: (source: SocialSource, key: string, channel: Channel | null) => {
                set((state) => {
                    state.allChannelData[source][key] = channel;
                });
            },
        })),
        {
            name: 'firefly-channels-data',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export const useChannelStoreState = createSelectors(useChannelStore);
