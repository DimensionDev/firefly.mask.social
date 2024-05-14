import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { Source } from '@/constants/enum.js';
import { patchNotificationQueryDataOnPost } from '@/helpers/patchNotificationQueryData.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Article } from '@/providers/types/Article.js';
import { type Post, type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function patchPostStats(stats: Post['stats'], status: boolean) {
    return {
        ...stats,
        comments: stats?.comments || 0,
        mirrors: stats?.mirrors || 0,
        reactions: stats?.reactions || 0,
        bookmarks: (stats?.bookmarks || 0) + (status ? 1 : -1),
    };
}

export function toggleBookmark(source: Source, postId: string, status: boolean) {
    patchPostQueryData(source, postId, (draft) => {
        draft.hasBookmarked = status;
        draft.stats = patchPostStats(draft.stats, status);
    });

    // Articles
    queryClient.setQueriesData<{ pages: Array<{ data: Article[] }> }>({ queryKey: ['articles', 'discover'] }, (old) => {
        if (!old) return old;

        return produce(old, (draft) => {
            draft.pages.forEach((page) => {
                page.data.forEach((article) => {
                    if (article.id === postId) article.hasBookmarked = status;
                });
            });
        });
    });

    patchNotificationQueryDataOnPost(source, (post) => {
        if (post.postId === postId) {
            post.hasBookmarked = status;
            post.stats = patchPostStats(post.stats, status);
        }
    });

    if (!status) {
        queryClient.setQueryData<{ pages: Array<{ data: Array<Post | Article> }> }>(
            ['posts', 'article', 'bookmark'],
            (old) => {
                if (!old) return old;
                return produce(old, (draft) => {
                    draft.pages.forEach((page) => {
                        page.data = page.data.filter((post) => {
                            if ('id' in post) return post.id !== postId; // Article
                            else return post.postId !== postId; // Post
                        });
                    });
                });
            },
        );
    }
}

const METHODS_BE_OVERRIDDEN = ['bookmark', 'unbookmark'] as const;

export function SetQueryDataForBookmarkPost(source: Source) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (postId: string, ...args: unknown[]) => {
                    const status = key === 'bookmark';
                    toggleBookmark(source, postId, status);
                    const m = method as (postId: string, ...args: unknown[]) => ReturnType<Provider[K]>;
                    try {
                        const result = await m.call(target.prototype, postId, ...args);
                        queryClient.invalidateQueries({ queryKey: ['posts', source, 'bookmark'] });

                        return result;
                    } catch (error) {
                        // rolling back
                        toggleBookmark(source, postId, !status);
                        throw error;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
