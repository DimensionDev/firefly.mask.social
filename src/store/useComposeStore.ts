import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { uniq } from 'lodash-es';
import { type Dispatch, type SetStateAction, useMemo } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { URL_REGEX } from '@/constants/regex.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { type Chars, readChars } from '@/helpers/readChars.js';
import { FrameLoader } from '@/libs/frame/Loader.js';
import { OpenGraphLoader } from '@/libs/og/Loader.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { Frame } from '@/types/frame.js';
import type { MediaObject } from '@/types/index.js';
import type { OpenGraph } from '@/types/og.js';
import type { RedPacketPayload } from '@/types/rp.js';

// A recursive version of Post will cause typescript failed to infer the type of the final exports.
type OrphanPost = Omit<Post, 'embedPosts' | 'comments' | 'root' | 'commentOn' | 'quoteOn'>;

interface ComposeState {
    type: 'compose' | 'quote' | 'reply';
    availableSources: SocialPlatform[];
    // If source is null, it means to post to all platforms.
    currentSource: SocialPlatform | null;
    // the parent post id
    lensPostId: string | null;
    farcasterPostId: string | null;
    post: OrphanPost | null;
    chars: Chars;
    typedMessage: TypedMessageTextV1 | null;
    video: MediaObject | null;
    images: MediaObject[];
    // parsed open graph from url in chars
    openGraph: OpenGraph | null;
    // parsed frames from urls in chars
    frames: Frame[];
    loading: boolean;
    redPacketPayload: RedPacketPayload | null;
    enableSource: (source: SocialPlatform) => void;
    disableSource: (source: SocialPlatform) => void;
    updateSources: (sources: SocialPlatform[]) => void;
    updateType: (type: 'compose' | 'quote' | 'reply') => void;
    updateCurrentSource: (source: SocialPlatform | null) => void;
    updateChars: Dispatch<SetStateAction<Chars>>;
    updateTypedMessage: (typedMessage: TypedMessageTextV1 | null) => void;
    updateLoading: (loading: boolean) => void;
    updatePost: (post: OrphanPost | null) => void;
    updateVideo: (video: MediaObject | null) => void;
    updateImages: Dispatch<SetStateAction<MediaObject[]>>;
    updateOpenGraph: (og: OpenGraph | null) => void;
    updateFrames: Dispatch<SetStateAction<Frame[]>>;
    addImage: (image: MediaObject) => void;
    removeImage: (image: MediaObject) => void;
    addFrame: (frame: Frame) => void;
    removeFrame: (frame: Frame) => void;
    updateLensPostId: (postId: string | null) => void;
    updateFarcasterPostId: (postId: string | null) => void;
    updateRedPacketPayload: (value: RedPacketPayload) => void;
    loadFramesFromChars: () => Promise<void>;
    loadOpenGraphFromChars: () => Promise<void>;
    clear: () => void;
}

function createInitState() {
    return {
        type: 'compose',
        availableSources: [SocialPlatform.Farcaster, SocialPlatform.Lens] as SocialPlatform[],
        currentSource: null,
        draft: null,
        post: null,
        chars: '',
        typedMessage: null,
        images: EMPTY_LIST,
        openGraph: null,
        frames: EMPTY_LIST,
        video: null,
        loading: false,
        lensPostId: null,
        farcasterPostId: null,
        redPacketPayload: null,
    } as const;
}

const useComposeStateBase = create<ComposeState, [['zustand/immer', unknown]]>(
    immer<ComposeState>((set, get) => ({
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
        updateOpenGraph: (og) =>
            set((state) => {
                state.openGraph = og;
            }),
        updateFrames: (frames) =>
            set((state) => {
                state.frames = typeof frames === 'function' ? frames(state.frames) : frames;
            }),
        updatePost: (post) =>
            set((state) => {
                state.post = post;
            }),
        updateVideo: (video) =>
            set((state) => {
                state.video = video;
            }),
        addImage: (image) =>
            set((state) => {
                state.images = [...state.images, image];
            }),
        removeImage: (target) =>
            set((state) => {
                state.images = state.images.filter((image) => image.file !== target.file);
            }),
        addFrame: (frame) =>
            set((state) => {
                state.frames = [...state.frames, frame];
            }),
        removeFrame: (target) =>
            set((state) => {
                state.frames = state.frames?.filter((frame) => frame !== target);
            }),
        updateLensPostId: (postId) =>
            set((state) => {
                state.lensPostId = postId;
            }),
        updateFarcasterPostId: (postId) =>
            set((state) => {
                state.farcasterPostId = postId;
            }),
        updateRedPacketPayload: (value) =>
            set((state) => {
                state.redPacketPayload = value;
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
        loadFramesFromChars: async () => {
            const chars = get().chars;
            const frames = await FrameLoader.occupancyLoad(readChars(chars, true));

            set((state) => {
                state.frames = frames;
            });
        },
        loadOpenGraphFromChars: async () => {
            const chars = get().chars;
            const og = await OpenGraphLoader.occupancyLoad(readChars(chars, true));

            set((state) => {
                state.openGraph = og;
            });
        },
        clear: () =>
            set((state) => {
                Object.assign(state, createInitState());
            }),
    })),
);

export const useComposeStateStore = createSelectors(useComposeStateBase);

/**
 * The first link in plain post.
 */
export function useComposeLink() {
    const { chars, images, video } = useComposeStateStore();
    return useMemo(() => {
        if (images.length || video) return null;
        const match = chars.toString().match(URL_REGEX);
        return match ? match[0] : null;
    }, [chars, images.length, !!video]);
}
