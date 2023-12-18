import type { TypedMessageTextV1 } from '@masknet/typed-message';
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
    typedMessage: TypedMessageTextV1 | null;
    video: IPFS_MediaObject | null;
    images: IPFS_MediaObject[];
    loading: boolean;
    updateSource: (source: SocialPlatform | null) => void;
    updateType: (type: 'compose' | 'quote' | 'reply') => void;
    updateChars: (chars: string) => void;
    updateTypedMessage: (typedMessage: TypedMessageTextV1 | null) => void;
    updateLoading: (loading: boolean) => void;
    updatePost: (post: OrphanPost | null) => void;
    updateVideo: (video: IPFS_MediaObject | null) => void;
    updateImages: (images: IPFS_MediaObject[]) => void;
    addImage: (image: IPFS_MediaObject) => void;
    removeImageByIndex: (index: number) => void;
    clear: () => void;
}

const useComposeStateBase = create<ComposeState, [['zustand/immer', unknown]]>(
    immer<ComposeState>((set, get) => ({
        type: 'compose',
        source: null,
        draft: null,
        post: null,
        chars: '',
        typedMessage: null,
        images: EMPTY_LIST,
        video: null,
        loading: false,
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
        updateTypedMessage: (typedMessage: TypedMessageTextV1 | null) =>
            set((state) => {
                return {
                    ...state,
                    typedMessage,
                };
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
        removeImageByIndex: (index: number) =>
            set((state) => {
                state.images = state.images.filter((_, i) => i !== index);
            }),
        clear: () =>
            set((state) => {
                state.post = null;
                state.chars = '';
                state.typedMessage = null;
                state.images = EMPTY_LIST;
                state.video = null;
                state.loading = false;
            }),
    })),
);

export const useComposeStateStore = createSelectors(useComposeStateBase);
