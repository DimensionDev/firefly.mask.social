import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { compact, uniq } from 'lodash-es';
import { type SetStateAction, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';
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

    // operations upon the thread
    addPostInThread: () => void;
    removePostInThread: (cursor: Cursor) => void;
    updatePostInThread: (cursor: Cursor, post: SetStateAction<CompositePost>) => void;

    // switch to the current compose type (posts in thread share the same compose type)
    updateType: (type: ComposeType) => void;

    // switch to the current editable post
    updateCursor: (cursor: Cursor) => void;

    // operations upon the current editable post
    enableSource: (source: SocialPlatform, cursor?: Cursor) => void;
    disableSource: (source: SocialPlatform, cursor?: Cursor) => void;
    updatePostId: (source: SocialPlatform, postId: string, cursor?: Cursor) => void;
    updateParentPost: (source: SocialPlatform, parentPost: Post, cursor?: Cursor) => void;
    updateRestriction: (restriction: RestrictionType, cursor?: Cursor) => void;
    updateAvailableSources: (sources: SocialPlatform[], cursor?: Cursor) => void;
    updateChars: (charsOrUpdater: SetStateAction<Chars>, cursor?: Cursor) => void;
    updateTypedMessage: (typedMessage: TypedMessageTextV1 | null, cursor?: Cursor) => void;
    updateVideo: (video: MediaObject | null, cursor?: Cursor) => void;
    updateImages: (imagesOrUpdater: SetStateAction<MediaObject[]>, cursor?: Cursor) => void;
    addImage: (image: MediaObject, cursor?: Cursor) => void;
    removeImage: (image: MediaObject, cursor?: Cursor) => void;
    addFrame: (frame: Frame, cursor?: Cursor) => void;
    removeFrame: (frame: Frame, cursor?: Cursor) => void;
    removeOpenGraph: (og: OpenGraph, cursor?: Cursor) => void;
    updateRpPayload: (value: RedPacketPayload, cursor?: Cursor) => void;
    loadFramesFromChars: (cursor?: Cursor) => Promise<void>;
    loadOpenGraphsFromChars: (cursor?: Cursor) => Promise<void>;

    // reset the editor
    clear: () => void;
}

function createInitSinglePostState(cursor: Cursor): CompositePost {
    const currentProfileAll = getCurrentProfileAll();
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
        availableSources: compact(
            Object.entries(currentProfileAll).map(([source, profile]) =>
                profile ? (source as SocialPlatform) : undefined,
            ),
        ),
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
        updateType: (type) =>
            set((state) => {
                state.type = type;
            }),
        enableSource: (source, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        availableSources: uniq([...post.availableSources, source]),
                    }),
                    cursor,
                ),
            ),
        disableSource: (source, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        availableSources: post.availableSources.filter((s) => s !== source),
                    }),
                    cursor,
                ),
            ),
        updateParentPost: (source, parentPost, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        parentPost: {
                            [SocialPlatform.Lens]: null,
                            [SocialPlatform.Farcaster]: null,
                            [SocialPlatform.Twitter]: null,

                            // a post can only have one parent post in specific platform
                            [source]: parentPost,
                        },
                    }),
                    cursor,
                ),
            ),
        updatePostId: (source, postId, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        postId: {
                            ...post.postId,
                            [source]: postId,
                        },
                    }),
                    cursor,
                ),
            ),
        updateRestriction: (restriction, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        restriction,
                    }),
                    cursor,
                ),
            ),
        updateChars: (charsOrUpdater, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        chars: typeof charsOrUpdater === 'function' ? charsOrUpdater(post.chars) : charsOrUpdater,
                    }),
                    cursor,
                ),
            ),
        updateTypedMessage: (typedMessage, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        typedMessage,
                    }),
                    cursor,
                ),
            ),
        updateImages: (imagesOrUpdater, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        images: typeof imagesOrUpdater === 'function' ? imagesOrUpdater(post.images) : imagesOrUpdater,
                    }),
                    cursor,
                ),
            ),
        updateVideo: (video, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        video,
                    }),
                    cursor,
                ),
            ),
        addImage: (image, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        images: [...post.images, image],
                    }),
                    cursor,
                ),
            ),
        removeImage: (target, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        images: post.images.filter((image) => image.file !== target.file),
                    }),
                    cursor,
                ),
            ),
        addFrame: (frame, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        frames: [...post.frames, frame],
                    }),
                    cursor,
                ),
            ),
        removeFrame: (target, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        frames: post.frames.filter((frame) => frame !== target),
                    }),
                    cursor,
                ),
            ),
        removeOpenGraph: (target, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        openGraphs: post.openGraphs.filter((openGraph) => openGraph !== target),
                    }),
                    cursor,
                ),
            ),
        updateRpPayload: (payload, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        rpPayload: payload,
                    }),
                    cursor,
                ),
            ),
        updateAvailableSources: (sources, cursor) => {
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        availableSources: sources,
                    }),
                    cursor,
                ),
            );
        },
        loadFramesFromChars: async (cursor) => {
            const chars = pick(get(), (x) => x.chars);
            const frames = await FrameLoader.occupancyLoad(readChars(chars, true));

            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        frames,
                    }),
                    cursor,
                ),
            );
        },
        loadOpenGraphsFromChars: async (cursor) => {
            const chars = pick(get(), (x) => x.chars);
            const openGraphs = await OpenGraphLoader.occupancyLoad(readChars(chars, true));

            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        openGraphs,
                    }),
                    cursor,
                ),
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

export function useCompositePost() {
    const { posts, cursor } = useComposeStateStore();

    return useMemo(() => {
        const rootPost = posts[0];
        const compositePost = posts.find((x) => x.id === cursor) || createInitSinglePostState(initialPostCursor);

        return {
            rootPost,
            isRootPost: rootPost === compositePost,
            ...compositePost,
        };
    }, [posts, cursor]);
}
