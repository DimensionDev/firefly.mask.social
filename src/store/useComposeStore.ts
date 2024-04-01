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
export type OrphanPost = Omit<
    Post,
    'embedPosts' | 'comments' | 'root' | 'commentOn' | 'quoteOn' | 'firstComment' | 'threads'
>;

export interface CompositePost {
    id: Cursor;

    // tracking the post id in specific platform if it's posted
    postId: Record<SocialPlatform, string | null>;
    // tracking the parent post in specific platform
    parentPost: Record<SocialPlatform, OrphanPost | null>;

    restriction: RestrictionType;
    availableSources: SocialPlatform[];
    chars: Chars;
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
    posts: CompositePost[];

    // helpers
    computed: {
        // if the current editable post is deleted
        // the next available post will be focused
        nextAvailablePost: CompositePost | null;
    };

    // tracking the current editable post
    cursor: Cursor;
    // composite the current editable post
    compositePost: CompositePost;

    // operations upon the thread
    addPostInThread: () => void;
    removePostInThread: (cursor: Cursor) => void;
    updatePostInThread: (cursor: Cursor, post: SetStateAction<CompositePost>) => void;

    // switch to the current editable post
    updateCursor: (cursor: Cursor) => void;

    // operations upon the current editable post
    enableSource: (source: SocialPlatform) => void;
    disableSource: (source: SocialPlatform) => void;
    updatePostId: (source: SocialPlatform, postId: string) => void;
    updateParentPost: (source: SocialPlatform, parentPost: Post) => void;
    updateRestriction: (restriction: RestrictionType) => void;
    updateAvailableSources: (sources: SocialPlatform[]) => void;
    updateType: (type: ComposeType) => void;
    updateChars: Dispatch<SetStateAction<Chars>>;
    updateTypedMessage: (typedMessage: TypedMessageTextV1 | null) => void;
    updateVideo: (video: MediaObject | null) => void;
    updateImages: Dispatch<SetStateAction<MediaObject[]>>;
    addImage: (image: MediaObject) => void;
    removeImage: (image: MediaObject) => void;
    addFrame: (frame: Frame) => void;
    removeFrame: (frame: Frame) => void;
    removeOpenGraph: (og: OpenGraph) => void;
    updateRpPayload: (value: RedPacketPayload) => void;
    loadFramesFromChars: () => Promise<void>;
    loadOpenGraphsFromChars: () => Promise<void>;
    clear: () => void;
}

function createInitSinglePostState(cursor: Cursor): CompositePost {
    return {
        id: cursor,
        postId: {
            [SocialPlatform.Farcaster]: null,
            [SocialPlatform.Lens]: null,
            [SocialPlatform.Twitter]: null,
        },
        parentPost: {
            [SocialPlatform.Farcaster]: null,
            [SocialPlatform.Lens]: null,
            [SocialPlatform.Twitter]: null,
        },
        availableSources: [SocialPlatform.Farcaster, SocialPlatform.Lens] as SocialPlatform[],
        restriction: RestrictionType.Everyone,
        chars: '',
        typedMessage: null,
        images: EMPTY_LIST,
        frames: EMPTY_LIST,
        openGraphs: EMPTY_LIST,
        video: null,
        rpPayload: null,
    };
}

const pick = <T>(s: ComposeState, _: (post: CompositePost) => T, cursor = s.cursor): T =>
    _(s.posts.find((x) => x.id === cursor)!);

const next = (s: ComposeState, _: (post: CompositePost) => CompositePost, cursor = s.cursor): ComposeState => ({
    ...s,
    posts: s.posts.map((x) => (x.id === cursor ? _(x) : x)),
});

const initialPostCursor = uuid();

const useComposeStateBase = create<ComposeState, [['zustand/immer', unknown]]>(
    immer<ComposeState>((set, get) => ({
        type: 'compose',
        cursor: initialPostCursor,
        posts: [createInitSinglePostState(initialPostCursor)],

        computed: {
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
            get postId() {
                return pick(get(), (x) => x.postId);
            },
            get parentPost() {
                return pick(get(), (x) => x.parentPost);
            },
        },

        addPostInThread: () =>
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
        removePostInThread: (cursor) =>
            set((state) => {
                const next = state.computed.nextAvailablePost;
                if (!next) return state;

                return {
                    ...state,
                    posts: state.posts.filter((x) => x.id !== cursor),
                    cursor: next.id,
                };
            }),
        updatePostInThread: (cursor, post) =>
            set((state) =>
                next(
                    state,
                    (x) =>
                        x.id === cursor
                            ? typeof post === 'function'
                                ? post(x)
                                : {
                                      ...x,
                                      ...post,
                                  }
                            : x,
                    cursor,
                ),
            ),
        updateCursor: (cursor) =>
            set((state) => {
                state.cursor = cursor;
            }),
        updateType: (type: ComposeType) =>
            set((state) => {
                state.type = type;
            }),
        updateParentPost: (source, parentPost) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    parentPost: {
                        [SocialPlatform.Lens]: null,
                        [SocialPlatform.Farcaster]: null,
                        [SocialPlatform.Twitter]: null,

                        // a post can only have one parent post in specific platform
                        [source]: parentPost,
                    },
                })),
            ),
        updatePostId: (source, postId) =>
            set((state) =>
                next(state, (post) => ({
                    ...post,
                    postId: {
                        ...post.postId,
                        [source]: postId,
                    },
                })),
            ),
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
