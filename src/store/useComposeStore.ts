import { EMPTY_LIST } from '@masknet/shared-base';
import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { clone, difference, uniq } from 'lodash-es';
import { type SetStateAction } from 'react';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { HOME_CHANNEL } from '@/constants/channel.js';
import { RestrictionType, type SocialSource, Source } from '@/constants/enum.js';
import { MAX_FRAME_SIZE_PER_POST, SORTED_POLL_SOURCES, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { CHAR_TAG, type Chars, readChars } from '@/helpers/chars.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentAvailableSources } from '@/helpers/getCurrentAvailableSources.js';
import { isValidRestrictionType } from '@/helpers/isValidRestrictionType.js';
import { createPoll } from '@/helpers/polls.js';
import { BlinkLoader } from '@/providers/blink/Loader.js';
import { BlinkParser } from '@/providers/blink/Parser.js';
import { FrameLoader } from '@/providers/frame/Loader.js';
import { OpenGraphLoader } from '@/providers/og/Loader.js';
import type { CompositePoll } from '@/providers/types/Poll.js';
import type { Channel, Post } from '@/providers/types/SocialMedia.js';
import type { Action } from '@/types/blink.js';
import { type ComposeType, type MediaObject } from '@/types/compose.js';
import type { Frame } from '@/types/frame.js';
import type { OpenGraph } from '@/types/og.js';
import type { RedPacketPayload } from '@/types/rp.js';

// post id for tracking the current editable post
type Cursor = string;

// A recursive version of Post will cause typescript failed to infer the type of the final exports.
export type OrphanPost = Omit<
    Post,
    'embedPosts' | 'comments' | 'root' | 'commentOn' | 'quoteOn' | 'firstComment' | 'threads'
>;

// A composite post uses availableSources of the root post.
export interface CompositePost {
    id: Cursor;

    // tracking the post id in specific platform if it's posted
    postId: Record<SocialSource, string | null>;
    // tracking the parent post in specific platform
    parentPost: Record<SocialSource, OrphanPost | null>;
    // tracking error
    postError: Record<SocialSource, Error | null>;

    // shared properties
    restriction: RestrictionType;
    availableSources: SocialSource[];
    channel: Record<SocialSource, Channel | null>;

    chars: Chars;
    typedMessage: TypedMessageTextV1 | null;
    video: MediaObject | null;
    images: MediaObject[];
    poll: CompositePoll | null;
    rpPayload: RedPacketPayload | null;
    // parsed frames from urls in chars
    frames: Frame[];
    // parsed open graphs from url in chars
    openGraphs: OpenGraph[];
    // parsed solana blinks from url in chars
    actions: Action[];
}

export interface ComposeBaseState {
    type: ComposeType;
    posts: CompositePost[];
    // tracking the current editable post
    cursor: Cursor;
    // tracking the current applied draft id
    draftId?: string;
}

interface ComposeState extends ComposeBaseState {
    // helpers
    computed: {
        // if the current editable post is deleted
        // the next available post will be focused
        nextAvailablePost: CompositePost | null;
    };

    // operations upon the thread
    addPostInThread: () => void;
    removePostInThread: (cursor: Cursor) => void;
    updatePostInThread: (cursor: Cursor, post: SetStateAction<CompositePost>) => void;

    // switch to the current compose type (posts in thread share the same compose type)
    updateType: (type: ComposeType) => void;

    // switch to the current editable post
    updateCursor: (cursor: Cursor) => void;

    // operations upon all posts
    enableSource: (source: SocialSource) => void;
    disableSource: (source: SocialSource) => void;
    updateRestriction: (restriction: RestrictionType) => void;
    updateChannel: (channel: Channel) => void;

    // operations upon the current editable post
    updatePostId: (source: SocialSource, postId: string, cursor?: Cursor) => void;
    updatePostError: (source: SocialSource, postError: Error, cursor?: Cursor) => void;
    updateParentPost: (source: SocialSource, parentPost: Post, cursor?: Cursor) => void;
    updateAvailableSources: (sources: SocialSource[], cursor?: Cursor) => void;
    updateChars: (charsOrUpdater: SetStateAction<Chars>, cursor?: Cursor) => void;
    updateTypedMessage: (typedMessage: TypedMessageTextV1 | null, cursor?: Cursor) => void;
    updateVideo: (video: MediaObject | null, cursor?: Cursor) => void;
    updateImages: (imagesOrUpdater: SetStateAction<MediaObject[]>, cursor?: Cursor) => void;
    addImage: (image: MediaObject, cursor?: Cursor) => void;
    removeImage: (image: MediaObject, cursor?: Cursor) => void;
    addFrame: (frame: Frame, cursor?: Cursor) => void;
    removeFrame: (frame: Frame, cursor?: Cursor) => void;
    removeOpenGraph: (og: OpenGraph, cursor?: Cursor) => void;
    removeBlink: (blinks: Action, cursor?: Cursor) => void;
    updateRpPayload: (value: RedPacketPayload, cursor?: Cursor) => void;
    loadComponentsFromChars: (cursor?: Cursor) => Promise<void>;
    createPoll: (cursor?: Cursor) => void;
    updatePoll: (poll: CompositePoll | null, cursor?: Cursor) => void;

    // reset the editor
    apply: (state: ComposeBaseState) => void;
    clear: () => void;
}

export function createInitPostState(): Record<SocialSource, null> {
    return {
        [Source.Farcaster]: null,
        [Source.Lens]: null,
        [Source.Twitter]: null,
    };
}

export function createInitSinglePostState(cursor: Cursor): CompositePost {
    return {
        id: cursor,
        postId: createInitPostState(),
        postError: createInitPostState(),
        parentPost: createInitPostState(),
        availableSources: getCurrentAvailableSources(),
        restriction: RestrictionType.Everyone,
        chars: '',
        typedMessage: null,
        images: EMPTY_LIST,
        frames: EMPTY_LIST,
        openGraphs: EMPTY_LIST,
        actions: EMPTY_LIST,
        video: null,
        rpPayload: null,
        channel: {
            [Source.Farcaster]: HOME_CHANNEL,
            [Source.Lens]: null,
            [Source.Twitter]: null,
        },
        poll: null,
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
    immer((set, get) => ({
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
                    {
                        ...createInitSinglePostState(cursor),
                        availableSources: state.posts[0].availableSources,
                        restriction: state.posts[0].restriction,
                        channel: clone(state.posts[0].channel),
                    },
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
        enableSource: (source) =>
            set((state) => ({
                ...state,
                posts: state.posts.map((x) => {
                    const availableSources = uniq([...x.availableSources, source]);
                    return {
                        ...x,
                        restriction: isValidRestrictionType(x.restriction, availableSources)
                            ? x.restriction
                            : RestrictionType.Everyone,
                        availableSources: SORTED_SOCIAL_SOURCES.filter((x) => availableSources.includes(x)),
                    };
                }),
            })),
        disableSource: (source) =>
            set((state) => ({
                ...state,
                posts: state.posts.map((x) => {
                    const availableSources = x.availableSources.filter((s) => s !== source);
                    return {
                        ...x,
                        availableSources: SORTED_SOCIAL_SOURCES.filter((x) => availableSources.includes(x)),
                    };
                }),
            })),
        updateParentPost: (source, parentPost, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        parentPost: {
                            [Source.Lens]: null,
                            [Source.Farcaster]: null,
                            [Source.Twitter]: null,
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
        updatePostError: (source, postError, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        postId: {
                            ...post.postId,
                            [source]: postError,
                        },
                    }),
                    cursor,
                ),
            ),
        updateRestriction: (restriction) =>
            set((state) => ({
                ...state,
                posts: state.posts.map((x) => ({
                    ...x,
                    restriction,
                })),
            })),
        updateChannel: (channel) =>
            set((state) => ({
                ...state,
                posts: state.posts.map((x) => ({
                    ...x,
                    channel: {
                        ...x.channel,
                        [channel.source]: channel,
                    },
                })),
            })),
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
        removeBlink: (target, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        actions: post.actions.filter((blink) => blink !== target),
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
        loadComponentsFromChars: async (cursor) => {
            const chars = pick(get(), (x) => x.chars);
            const content = readChars(chars, 'visible');

            const parsedActionSchemes = BlinkParser.extractSchemes(content);
            const urls = parsedActionSchemes.map((x) => x.url);
            const frames = await FrameLoader.occupancyLoad(urls);
            const openGraphs = await OpenGraphLoader.occupancyLoad(
                difference(
                    urls.slice(-1),
                    frames.map((x) => x.url),
                ),
            );
            const actions = await BlinkLoader.occupancyLoad(parsedActionSchemes.map((url) => JSON.stringify(url)));

            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        frames: frames.map((x) => x.value).slice(0, MAX_FRAME_SIZE_PER_POST),
                        openGraphs: openGraphs.map((x) => x.value).slice(0, 1),
                        actions: actions.map((x) => x.value).slice(0, 1),
                    }),
                    cursor,
                ),
            );
        },
        createPoll: (cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        poll: createPoll(),
                        // only keep the sources that support poll
                        availableSources: post.availableSources.filter((x) => SORTED_POLL_SOURCES.includes(x)),
                        chars: [
                            ...(Array.isArray(post.chars) ? post.chars : [post.chars]),
                            { id: `poll-${uuid()}`, tag: CHAR_TAG.FRAME, visible: false, content: '' as never },
                        ],
                    }),
                    cursor,
                ),
            ),
        updatePoll: (poll, cursor) =>
            set((state) =>
                next(
                    state,
                    (post) => ({
                        ...post,
                        poll,
                        chars: !poll
                            ? (Array.isArray(post.chars) ? post.chars : [post.chars]).filter(
                                  (x) => typeof x === 'string' || x.tag !== CHAR_TAG.FRAME,
                              )
                            : post.chars,
                    }),
                    cursor,
                ),
            ),
        apply: (nextState) =>
            set((state) => {
                Object.assign(state, nextState);
            }),
        clear: () =>
            set((state) => {
                const id = uuid();
                const nextState = {
                    type: 'compose',
                    cursor: id,
                    draftId: undefined,
                    posts: [createInitSinglePostState(id)],
                } satisfies ComposeBaseState;

                Object.assign(state, nextState);
            }),
    })),
);

export const useComposeStateStore = createSelectors(useComposeStateBase);
