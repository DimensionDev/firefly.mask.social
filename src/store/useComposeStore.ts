import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { uniq } from 'lodash-es';
import type { Dispatch, SetStateAction } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Chars } from '@/helpers/readChars.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { Frame } from '@/types/frame.js';
import type { MediaObject, RedpacketProps } from '@/types/index.js';

// A recursive version of Post will cause typescript failed to infer the type of the final exports.
type OrphanPost = Omit<Post, 'embedPosts' | 'comments' | 'root' | 'commentOn' | 'quoteOn'>;

interface ComposeState {
    type: 'compose' | 'quote' | 'reply';
    availableSources: SocialPlatform[];
    // If source is null, it means to post to all platforms.
    currentSource: SocialPlatform | null;
    /** Parent post */
    lensPostId: string | null;
    farcasterPostId: string | null;
    frame: Frame | null;
    post: OrphanPost | null;
    chars: Chars;
    typedMessage: TypedMessageTextV1 | null;
    video: MediaObject | null;
    images: MediaObject[];
    loading: boolean;
    redpacketProps: RedpacketProps | null;
    enableSource: (source: SocialPlatform) => void;
    disableSource: (source: SocialPlatform) => void;
    updateSources: (sources: SocialPlatform[]) => void;
    updateType: (type: 'compose' | 'quote' | 'reply') => void;
    updateCurrentSource: (source: SocialPlatform | null) => void;
    updateChars: Dispatch<SetStateAction<Chars>>;
    updateTypedMessage: (typedMessage: TypedMessageTextV1 | null) => void;
    updateLoading: (loading: boolean) => void;
    updateFrame: (frame: Frame | null) => void;
    updatePost: (post: OrphanPost | null) => void;
    updateVideo: (video: MediaObject | null) => void;
    updateImages: Dispatch<SetStateAction<MediaObject[]>>;
    addImage: (image: MediaObject) => void;
    removeImage: (image: MediaObject) => void;
    removePost: () => void;
    removeFrame: () => void;
    updateLensPostId: (postId: string | null) => void;
    updateFarcasterPostId: (postId: string | null) => void;
    updateRedpacketProps: (value: RedpacketProps) => void;
    clear: () => void;
}

function createInitState() {
    return {
        type: 'compose',
        availableSources: [SocialPlatform.Farcaster, SocialPlatform.Lens] as SocialPlatform[],
        currentSource: null,
        draft: null,
        frame: null,
        post: null,
        chars: '',
        typedMessage: null,
        images: EMPTY_LIST,
        video: null,
        loading: false,
        lensPostId: null,
        farcasterPostId: null,
        redpacketProps: null,
    } as const;
}

const useComposeStateBase = create<ComposeState, [['zustand/immer', unknown]]>(
    immer<ComposeState>((set) => ({
        ...createInitState(),
        updateType: (type: 'compose' | 'quote' | 'reply') =>
            set((state) => {
                state.type = type;
            }),
        updateCurrentSource: (source: SocialPlatform | null) =>
            set((state) => {
                state.currentSource = source;
            }),
        updateChars: (chars) =>
            set((state) => {
                state.chars = typeof chars === 'function' ? chars(state.chars) : chars;
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
        updateImages: (images) =>
            set((state) => {
                state.images = typeof images === 'function' ? images(state.images) : images;
            }),
        updateFrame: (frame) =>
            set((state) => {
                state.frame = frame;
            }),
        updatePost: (post) =>
            set((state) => {
                state.post = post;
            }),
        removeFrame: () =>
            set((state) => {
                state.frame = null;
            }),
        removePost: () =>
            set((state) => {
                state.post = null;
            }),
        addImage: (image) =>
            set((state) => {
                state.images = [...state.images, image];
            }),
        updateVideo: (video) =>
            set((state) => {
                state.video = video;
            }),
        removeImage: (target) =>
            set((state) => {
                state.images = state.images.filter((image) => image.file !== target.file);
            }),
        updateLensPostId: (postId) =>
            set((state) => {
                state.lensPostId = postId;
            }),
        updateFarcasterPostId: (postId) =>
            set((state) => {
                state.farcasterPostId = postId;
            }),
        updateRedpacketProps: (value) =>
            set((state) => {
                state.redpacketProps = value;
            }),
        enableSource: (source) =>
            set((state) => {
                state.availableSources = uniq([...state.availableSources, source]);
            }),
        disableSource: (source) =>
            set((state) => {
                state.availableSources = state.availableSources.filter((s) => s !== source);
            }),
        updateSources: (sources) =>
            set((state) => {
                state.availableSources = sources;
            }),
        clear: () =>
            set((state) => {
                Object.assign(state, createInitState());
            }),
    })),
);

export const useComposeStateStore = createSelectors(useComposeStateBase);
