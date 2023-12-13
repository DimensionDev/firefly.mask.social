import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { IPFS_MediaObject } from '@/types/index.js';

// A recursive version of Post will cause typescript failed to infer the type of the final exports.
type OrphanPost = Omit<Post, 'embedPosts' | 'comments' | 'root' | 'commentOn' | 'quoteOn'>;

interface ComposeState {
    type: 'compose' | 'quote' | 'reply';
    post: OrphanPost | null;
    chars: string;
    images: IPFS_MediaObject[];
    video: IPFS_MediaObject | null;
    loading: boolean;
    isDraft: boolean;
    updateType: (type: 'compose' | 'quote' | 'reply') => void;
    updateChars: (chars: string) => void;
    updateLoading: (loading: boolean) => void;
    addPost: (post: OrphanPost) => void;
    removePost: () => void;
    addImage: (image: IPFS_MediaObject) => void;
    addImages: (images: IPFS_MediaObject[]) => void;
    addVideo: (video: IPFS_MediaObject) => void;
    removeVideo: () => void;
    removeImage: (index: number) => void;
    removeImages: () => void;
    save: () => void;
    clear: () => void;
}

const useComposeStateBase = create<ComposeState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer<ComposeState>((set, get) => ({
            type: 'compose',
            draft: null,
            post: null,
            chars: '',
            images: EMPTY_LIST,
            video: null,
            loading: false,
            isDraft: false,
            updateType: (type: 'compose' | 'quote' | 'reply') =>
                set((state) => {
                    state.type = type;
                }),
            updateChars: (chars: string) =>
                set((state) => {
                    state.chars = chars;
                }),
            updateLoading: (loading) =>
                set((state) => {
                    state.loading = loading;
                }),
            addPost: (post: OrphanPost) =>
                set((state) => {
                    state.post = post;
                }),
            removePost: () =>
                set((state) => {
                    state.post = null;
                }),
            addImage: (image: IPFS_MediaObject) =>
                set((state) => {
                    state.images = [...state.images, image];
                }),
            addImages: (images: IPFS_MediaObject[]) =>
                set((state) => {
                    state.images = [...state.images, ...images];
                }),
            addVideo: (video: IPFS_MediaObject) =>
                set((state) => {
                    state.video = video;
                }),
            removeVideo: () =>
                set((state) => {
                    state.video = null;
                }),
            removeImage: (index: number) =>
                set((state) => {
                    state.images = state.images.filter((_, i) => i !== index);
                }),
            removeImages: () =>
                set((state) => {
                    state.images = EMPTY_LIST;
                }),
            save: () =>
                set((state) => {
                    state.isDraft = true;
                }),
            clear: () =>
                set((state) => {
                    state.post = null;
                    state.chars = '';
                    state.images = EMPTY_LIST;
                    state.video = null;
                    state.loading = false;
                    state.isDraft = false;
                }),
        })),
        {
            name: 'compose-state',
        },
    ),
);

export const useComposeStateStore = createSelectors(useComposeStateBase);
