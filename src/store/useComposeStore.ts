import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { uniq } from 'lodash-es';
import { type Dispatch, type SetStateAction } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { type Chars, readChars } from '@/helpers/readChars.js';
import { FrameLoader } from '@/libs/frame/Loader.js';
import { OpenGraphLoader } from '@/libs/og/Loader.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { Frame } from '@/types/frame.js';
import type { MediaObject } from '@/types/index.js';
import type { OpenGraph } from '@/types/og.js';
import type { RedPacketPayload } from '@/types/rp.js';
import { RestrictionType } from '@/types/compose.js';

// A recursive version of Post will cause typescript failed to infer the type of the final exports.
type OrphanPost = Omit<Post, 'embedPosts' | 'comments' | 'root' | 'commentOn' | 'quoteOn'>;

interface ComposeState {
    type: 'compose' | 'quote' | 'reply';
    restriction: RestrictionType;
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
    // parsed frames from urls in chars
    frames: Frame[];
    // parsed open graphs from url in chars
    openGraphs: OpenGraph[];
    redPacketPayload: RedPacketPayload | null;
    enableSource: (source: SocialPlatform) => void;
    disableSource: (source: SocialPlatform) => void;
    updateRestriction: (restriction: RestrictionType) => void;
    updateSources: (sources: SocialPlatform[]) => void;
    updateType: (type: 'compose' | 'quote' | 'reply') => void;
    updateCurrentSource: (source: SocialPlatform | null) => void;
    updateChars: Dispatch<SetStateAction<Chars>>;
    updateTypedMessage: (typedMessage: TypedMessageTextV1 | null) => void;
    updatePost: (post: OrphanPost | null) => void;
    updateVideo: (video: MediaObject | null) => void;
    updateImages: Dispatch<SetStateAction<MediaObject[]>>;
    addImage: (image: MediaObject) => void;
    removeImage: (image: MediaObject) => void;
    addFrame: (frame: Frame) => void;
    removeFrame: (frame: Frame) => void;
    removeOpenGraph: (og: OpenGraph) => void;
    updateLensPostId: (postId: string | null) => void;
    updateFarcasterPostId: (postId: string | null) => void;
    updateRedPacketPayload: (value: RedPacketPayload) => void;
    loadFramesFromChars: () => Promise<void>;
    loadOpenGraphsFromChars: () => Promise<void>;
    clear: () => void;
}

function createInitState() {
    return {
        type: 'compose',
        availableSources: [SocialPlatform.Farcaster, SocialPlatform.Lens] as SocialPlatform[],
        currentSource: null,
        restriction: RestrictionType.Everyone,
        draft: null,
        post: null,
        chars: '',
        typedMessage: null,
        images: EMPTY_LIST,
        frames: EMPTY_LIST,
        openGraphs: EMPTY_LIST,
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
        updateRestriction: (restriction) =>
            set((state) => {
                state.restriction = restriction;
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
        updateImages: (images) =>
            set((state) => {
                state.images = typeof images === 'function' ? images(state.images) : images;
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
        removeOpenGraph: (target) =>
            set((state) => {
                state.openGraphs = state.openGraphs.filter((openGraph) => openGraph !== target);
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
        loadOpenGraphsFromChars: async () => {
            const chars = get().chars;
            const openGraphs = await OpenGraphLoader.occupancyLoad(readChars(chars, true));

            set((state) => {
                state.openGraphs = openGraphs;
            });
        },
        clear: () =>
            set((state) => {
                Object.assign(state, createInitState());
            }),
    })),
);

export const useComposeStateStore = createSelectors(useComposeStateBase);
