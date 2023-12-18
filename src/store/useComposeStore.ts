import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { IPFS_MediaObject } from '@/types/index.js';

// A recursive version of Post will cause typescript failed to infer the type of the final exports.
type OrphanPost = Omit<Post, 'embedPosts' | 'comments' | 'root' | 'commentOn' | 'quoteOn'>;

interface ComposeState {
    type: 'compose' | 'quote' | 'reply';
    // If source is null, it means to post to all platforms.
    source: SocialPlatform | null;
    post: OrphanPost | null;
    chars: string;
    video: IPFS_MediaObject | null;
    images: IPFS_MediaObject[];
    loading: boolean;
    isDraft: boolean;
    updateSource: (source: SocialPlatform) => void;
    updateType: (type: 'compose' | 'quote' | 'reply') => void;
    updateChars: (chars: string) => void;
    updateLoading: (loading: boolean) => void;
    updatePost: (post: OrphanPost | null) => void;
    updateVideo: (video: IPFS_MediaObject | null) => void;
    updateImages: (images: IPFS_MediaObject[]) => void;
    addImage: (image: IPFS_MediaObject) => void;
    removeImage: (index: number) => void;
    save: () => void;
    clear: () => void;
}

const useComposeStateBase = create<ComposeState, [['zustand/immer', unknown]]>(
    immer<ComposeState>((set, get) => ({
        type: 'compose',
        source: null,
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
        updateSource: (source: SocialPlatform | null) =>
            set((state) => {
                state.source = source;
            }),
        updateChars: (chars: string) =>
            set((state) => {
                state.chars = chars;
            }),
        updateLoading: (loading) =>
            set((state) => {
                state.loading = loading;
            }),
        updateImages: (images: IPFS_MediaObject[]) =>
            set((state) => {
                state.images = images;
            }),
        updatePost: (post: OrphanPost | null) =>
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
        updateVideo: (video: IPFS_MediaObject | null) =>
            set((state) => {
                state.video = video;
            }),
        removeImage: (index: number) =>
            set((state) => {
                state.images = state.images.filter((_, i) => i !== index);
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
);

export const useComposeStateStore = createSelectors(useComposeStateBase);
