import { EMPTY_LIST } from '@masknet/shared-base';
import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { type Draft as WritableDraft } from 'immer';
import localforage from 'localforage';
import { clone, difference, uniq } from 'lodash-es';
import { type SetStateAction } from 'react';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { HOME_CHANNEL } from '@/constants/channel.js';
import { RestrictionType, type SocialSource, Source } from '@/constants/enum.js';
import { MAX_FRAME_SIZE_PER_POST, SORTED_POLL_SOURCES, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { type Chars, readChars } from '@/helpers/chars.js';
import { createPoll } from '@/helpers/createPoll.js';
import { createSelectors } from '@/helpers/createSelector.js';
import { getCurrentAvailableSources } from '@/helpers/getCurrentAvailableSources.js';
import { isValidRestrictionType } from '@/helpers/isValidRestrictionType.js';
import { matchUrls } from '@/helpers/matchUrls.js';
import { FrameLoader } from '@/libs/frame/Loader.js';
import { OpenGraphLoader } from '@/libs/og/Loader.js';
import type { Poll } from '@/providers/types/Poll.js';
import type { Channel, Post } from '@/providers/types/SocialMedia.js';
import { type ComposeType } from '@/types/compose.js';
import type { Frame } from '@/types/frame.js';
import type { MediaObject } from '@/types/index.js';
import type { OpenGraph } from '@/types/og.js';
import type { RedPacketPayload } from '@/types/rp.js';

const storageInstance = localforage.createInstance({
    name: 'firefly-draft-storage',
});

const storage: PersistStorage<{ drafts: Draft[] }> = {
    getItem: (name: string) => {
        return storageInstance.getItem(name);
    },
    setItem: (name: string, value: unknown) => {
        storageInstance.setItem(name, value);
    },
    removeItem: (name: string) => storageInstance.removeItem(name),
};

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
    poll: Poll | null;
    rpPayload: RedPacketPayload | null;
    // parsed frames from urls in chars
    frames: Frame[];
    // parsed open graphs from url in chars
    openGraphs: OpenGraph[];
}

export interface ComposeBaseState {
    type: ComposeType;
    posts: CompositePost[];

    // tracking the current editable post
    cursor: Cursor;
}

export interface Draft extends ComposeBaseState {
    savedOn: Date;
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
    updateRpPayload: (value: RedPacketPayload, cursor?: Cursor) => void;
    loadComponentsFromChars: (cursor?: Cursor) => Promise<void>;
    createPoll: (cursor?: Cursor) => void;
    updatePoll: (poll: Poll | null, cursor?: Cursor) => void;

    // reset the editor
    clear: () => void;

    // drafts
    drafts: Draft[];
    addDraft: (draft: Draft) => void;
    removeDraft: (cursor: string) => void;
    applyDraft: (draft: Draft) => void;
}

function createInitSinglePostState(cursor: Cursor): CompositePost {
    return {
        id: cursor,
        postId: {
            [Source.Farcaster]: null,
            [Source.Lens]: null,
            [Source.Twitter]: null,
        },
        postError: {
            [Source.Farcaster]: null,
            [Source.Lens]: null,
            [Source.Twitter]: null,
        },
        parentPost: {
            [Source.Farcaster]: null,
            [Source.Lens]: null,
            [Source.Twitter]: null,
        },
        availableSources: getCurrentAvailableSources(),
        restriction: RestrictionType.Everyone,
        chars: '',
        typedMessage: null,
        images: EMPTY_LIST,
        frames: EMPTY_LIST,
        openGraphs: EMPTY_LIST,
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

const useComposeStateBase = create<ComposeState, [['zustand/persist', unknown], ['zustand/immer', never]]>(
    persist(
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
            drafts: EMPTY_LIST,
            addDraft: (draft: Draft) =>
                set((state) => {
                    const index = state.drafts.findIndex((x) => x.cursor === draft.cursor);
                    if (index === -1) {
                        state.drafts.push(draft as WritableDraft<Draft>);
                    } else {
                        state.drafts[index] = draft as WritableDraft<Draft>;
                    }
                }),
            removeDraft: (cursor: string) => {
                set((state) => {
                    state.drafts = state.drafts.filter((x) => x.cursor !== cursor);
                });
            },
            applyDraft: (draft: Draft) =>
                set((state) => {
                    state.type = draft.type;
                    state.cursor = draft.cursor;
                    state.posts = draft.posts as WritableDraft<CompositePost[]>;
                }),
            addPostInThread: () =>
                set((state) => {
                    const cursor = uuid();
                    const index = state.posts.findIndex((x) => x.id === state.cursor);

                    const nextPosts = [
                        ...state.posts.slice(0, index + 1),
                        {
                            ...createInitSinglePostState(cursor),
                            availableSources: state.posts[0].availableSources,
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
                        (post) => {
                            return {
                                ...post,
                                chars:
                                    typeof charsOrUpdater === 'function' ? charsOrUpdater(post.chars) : charsOrUpdater,
                            };
                        },
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
                            images:
                                typeof imagesOrUpdater === 'function' ? imagesOrUpdater(post.images) : imagesOrUpdater,
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
            loadComponentsFromChars: async (cursor) => {
                const chars = pick(get(), (x) => x.chars);
                const urls = matchUrls(readChars(chars, true));
                const frames = await FrameLoader.occupancyLoad(urls);
                const openGraphs = await OpenGraphLoader.occupancyLoad(
                    difference(
                        urls.slice(-1),
                        frames.map((x) => x.url),
                    ),
                );

                set((state) =>
                    next(
                        state,
                        (post) => ({
                            ...post,
                            frames: frames.map((x) => x.value).slice(0, MAX_FRAME_SIZE_PER_POST),
                            openGraphs: openGraphs.map((x) => x.value).slice(0, 1),
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
                        }),
                        cursor,
                    ),
                ),
            clear: () =>
                set((state) => {
                    const id = uuid();
                    Object.assign(state, {
                        type: 'compose',
                        cursor: id,
                        posts: [createInitSinglePostState(id)],
                    });
                }),
        })),
        {
            storage,
            partialize: (state) => ({ drafts: state.drafts }),
            name: 'firefly-compose-state',
        },
    ),
);

export const useComposeStateStore = createSelectors(useComposeStateBase);
