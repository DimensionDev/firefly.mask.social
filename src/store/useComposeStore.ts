import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { uniq } from 'lodash-es';
import { type Dispatch, type SetStateAction } from 'react';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { type Chars, readChars } from '@/helpers/readChars.js';
import { FrameLoader } from '@/libs/frame/Loader.js';
import { OpenGraphLoader } from '@/libs/og/Loader.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { type ComposeType, RestrictionType } from '@/types/compose.js';
import type { Frame } from '@/types/frame.js';
import type { MediaObject } from '@/types/index.js';
import type { OpenGraph } from '@/types/og.js';
import type { RedPacketPayload } from '@/types/rp.js';

// post id for tracking the current editable post
type Cursor = string;

// A recursive version of Post will cause typescript failed to infer the type of the final exports.
export type OrphanPost = Omit<Post, 'embedPosts' | 'comments' | 'root' | 'commentOn' | 'quoteOn'>;

export interface CompositePost {
    id: Cursor;

    // the post id on lens
    lensPostId: string | null;
    // the post id on farcaster
    farcasterPostId: string | null;

    restriction: RestrictionType;
    availableSources: SocialPlatform[];

    chars: Chars;
    // parent post
    post: OrphanPost | null;
    typedMessage: TypedMessageTextV1 | null;
    video: MediaObject | null;
    images: MediaObject[];
    // parsed frames from urls in chars
    frames: Frame[];
    // parsed open graphs from url in chars
    openGraphs: OpenGraph[];
    rpPayload: RedPacketPayload | null;
}

interface ComposeState {
    type: ComposeType;
    cursor: Cursor;
    posts: CompositePost[];

    helpers: {
        // if the current editable post is deleted
        // the next available post will be focused
        nextAvailablePost: CompositePost | null;
    };

    // composite the current editable post
    compositePost: CompositePost;

    // operations
    newPost: () => void;
    removePost: (cursor: Cursor) => void;
    updateCursor: (cursor: Cursor) => void;
    enableSource: (source: SocialPlatform) => void;
    disableSource: (source: SocialPlatform) => void;
    updateRestriction: (restriction: RestrictionType) => void;
    updateAvailableSources: (sources: SocialPlatform[]) => void;
    updateType: (type: ComposeType) => void;
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
    updateRpPayload: (value: RedPacketPayload) => void;
    loadFramesFromChars: () => Promise<void>;
    loadOpenGraphsFromChars: () => Promise<void>;
    clear: () => void;
}

function createInitSinglePostState(cursor: Cursor): CompositePost {
    return {
        id: cursor,
        lensPostId: null,
        farcasterPostId: null,
        availableSources: [SocialPlatform.Farcaster, SocialPlatform.Lens] as SocialPlatform[],
        restriction: RestrictionType.Everyone,
        post: null,
        chars: '',
        typedMessage: null,
        images: EMPTY_LIST,
        frames: EMPTY_LIST,
        openGraphs: EMPTY_LIST,
        video: null,
        rpPayload: null,
    };
}

const pick = <T>(s: ComposeState, _: (post: CompositePost) => T): T => _(s.posts.find((x) => x.id === s.cursor)!);

const next = (s: ComposeState, _: (post: CompositePost) => CompositePost): ComposeState => ({
    ...s,
    posts: s.posts.map((x) => (x.id === s.cursor ? _(x) : x)),
});

const initialPostCursor = uuid();

const useComposeStateBase = create<ComposeState, [['zustand/immer', unknown]]>(
    immer<ComposeState>((set, get) => ({
        type: 'compose',
        cursor: initialPostCursor,
        posts: [createInitSinglePostState(initialPostCursor)],

        helpers: {
            get nextAvailablePost() {
                const { cursor, posts } = get();

                const index = posts.findIndex((x) => x.id === cursor);
                if (index === -1) return null;

                const nextPosts = posts.filter((x) => x.id !== cursor);
                if (nextPosts.length === 0) return null;

                return nextPosts[Math.max(0, index - 1)];
            },
        },

        compositePost: {
            get id() {
                return pick(get(), (x) => x.id);
            },
            get availableSources() {
                return pick(get(), (x) => x.availableSources);
            },
            get restriction() {
                return pick(get(), (x) => x.restriction);
            },
            get post() {
                return pick(get(), (x) => x.post);
            },
            get chars() {
                return pick(get(), (x) => x.chars);
            },
            get typedMessage() {
                return pick(get(), (x) => x.typedMessage);
            },
            get images() {
                return pick(get(), (x) => x.images);
            },
            get frames() {
                return pick(get(), (x) => x.frames);
            },
            get openGraphs() {
                return pick(get(), (x) => x.openGraphs);
            },
            get video() {
                return pick(get(), (x) => x.video);
            },
            get rpPayload() {
                return pick(get(), (x) => x.rpPayload);
            },
            get lensPostId() {
                return pick(get(), (x) => x.lensPostId);
            },
            get farcasterPostId() {
                return pick(get(), (x) => x.farcasterPostId);
            },
        },

        newPost: () =>
            set((state) => {
                const cursor = uuid();
                const index = state.posts.findIndex((x) => x.id === state.cursor);

                const nextPosts = [
                    ...state.posts.slice(0, index + 1),
                    createInitSinglePostState(cursor),
                    ...state.posts.slice(index + 1), // corrected slicing here
                ];

                return {
                    ...state,
                    posts: nextPosts,
                    // focus the new added post
                    cursor,
                };
            }),
        removePost: (cursor) =>
            set((state) => {
                const next = state.helpers.nextAvailablePost;
                if (!next) return state;

                return {
                    ...state,
                    posts: state.posts.filter((x) => x.id !== cursor),
                    cursor: next.id,
                };
            }),
        updateCursor: (cursor) =>
            set((state) => {
                state.cursor = cursor;
            }),
        updateType: (type: ComposeType) =>
            set((state) => {
                state.type = type;
            }),
        updateRestriction: (restriction) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    restriction,
                })),
            ),
        updateChars: (chars) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    chars: typeof chars === 'function' ? chars(post.chars) : chars,
                })),
            ),
        updateTypedMessage: (typedMessage: TypedMessageTextV1 | null) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    typedMessage,
                })),
            ),
        updateImages: (images) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    images: typeof images === 'function' ? images(post.images) : images,
                })),
            ),
        updatePost: (orphanPost) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    post: orphanPost,
                })),
            ),
        updateVideo: (video) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    video,
                })),
            ),
        addImage: (image) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    images: [...post.images, image],
                })),
            ),
        removeImage: (target) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    images: post.images.filter((image) => image.file !== target.file),
                })),
            ),
        addFrame: (frame) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    frames: [...post.frames, frame],
                })),
            ),
        removeFrame: (target) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    frames: post.frames.filter((frame) => frame !== target),
                })),
            ),
        removeOpenGraph: (target) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    openGraphs: post.openGraphs.filter((openGraph) => openGraph !== target),
                })),
            ),
        updateLensPostId: (postId) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    lensPostId: postId,
                })),
            ),
        updateFarcasterPostId: (postId) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    farcasterPostId: postId,
                })),
            ),
        updateRpPayload: (payload) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    rpPayload: payload,
                })),
            ),
        enableSource: (source) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    availableSources: uniq([...post.availableSources, source]),
                })),
            ),
        disableSource: (source) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    availableSources: post.availableSources.filter((s) => s !== source),
                })),
            ),
        updateAvailableSources: (sources) => {
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    availableSources: sources,
                })),
            );
        },
        loadFramesFromChars: async () => {
            const chars = pick(get(), (x) => x.chars);
            const frames = await FrameLoader.occupancyLoad(readChars(chars, true));

            set((state) =>
                next(state, (post) => ({
                    ...post,
                    frames,
                })),
            );
        },
        loadOpenGraphsFromChars: async () => {
            const chars = pick(get(), (x) => x.chars);
            const openGraphs = await OpenGraphLoader.occupancyLoad(readChars(chars, true));

            set((state) =>
                next(state, (post) => ({
                    ...post,
                    openGraphs,
                })),
            );
        },
        clear: () =>
            set((state) =>
                Object.assign(state, {
                    type: 'compose',
                    cursor: initialPostCursor,
                    posts: [createInitSinglePostState(initialPostCursor)],
                }),
            ),
    })),
);

export const useComposeStateStore = createSelectors(useComposeStateBase);
