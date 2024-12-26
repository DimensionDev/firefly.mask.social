import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createPersistStorage } from '@/helpers/createPersistStorage.js';

type TwitterProfileId = string;
type TweetId = string;
type TwitterLikeKey = `${TwitterProfileId}:${TweetId}`;

interface TwitterLikeStore {
    likes: Record<TwitterLikeKey, boolean>;
    like: (profileId: TwitterProfileId, tweetId: TweetId) => void;
    unlike: (profileId: TwitterProfileId, tweetId: TweetId) => void;
    isLiked: (profileId: TwitterProfileId, tweetId: TweetId) => boolean;
    size: () => number;
}

function generateTwitterLikeKey(profileId: TwitterProfileId, tweetId: TweetId) {
    return `${profileId}:${tweetId}` as TwitterLikeKey;
}

export const useTwitterLikeStore = create<TwitterLikeStore, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
        immer((set, get) => ({
            likes: {},
            like: (profileId, tweetId) => {
                return set((state) => {
                    const key = generateTwitterLikeKey(profileId, tweetId);
                    if (!state.likes[key]) {
                        state.likes[key] = true;
                    }
                });
            },
            unlike: (profileId, tweetId) => {
                return set((state) => {
                    const key = generateTwitterLikeKey(profileId, tweetId);
                    if (state.likes[key]) {
                        delete state.likes[key];
                    }
                });
            },
            isLiked: (profileId, tweetId) => {
                const state = get();
                return state.likes[generateTwitterLikeKey(profileId, tweetId)];
            },
            size: () => {
                const state = get();
                return Object.keys(state.likes).length;
            },
        })),
        {
            storage: createPersistStorage<{ likes: Record<TwitterLikeKey, boolean> }>('twitter-like-store'),
            partialize: (state) => ({ likes: state.likes }),
            name: 'twitter-likes',
        },
    ),
);
