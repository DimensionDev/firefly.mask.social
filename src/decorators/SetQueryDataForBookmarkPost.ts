import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { SocialSource } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Post, Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

export function toggleBookmark(source: SocialSource, postId: string, status: boolean) {
    patchPostQueryData(source, postId, (draft) => {
        draft.hasBookmarked = status;
        draft.stats = produce(draft.stats, (old) => {
            return {
                ...old,
                comments: old?.comments || 0,
                mirrors: old?.mirrors || 0,
                reactions: old?.reactions || 0,
                bookmarks: (old?.bookmarks || 0) + (status ? 1 : -1),
            };
        });
    });

    queryClient.invalidateQueries({ queryKey: ['posts', source, 'bookmark'] });

    if (!status) {
        queryClient.setQueryData<{ pages: Array<{ data: Post[] }> }>(['posts', source, 'bookmark'], (old) => {
            if (!old) return old;
            return produce(old, (draft) => {
                draft.pages.forEach((page) => {
                    page.data = page.data.filter((post) => post.postId !== postId);
                });
            });
        });
    }
}

const METHODS_BE_OVERRIDDEN = ['bookmark', 'unbookmark'] as const;

export function SetQueryDataForBookmarkPost(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];
            const status = key === 'bookmark';

            Object.defineProperty(target.prototype, key, {
                value: async (postId: string, ...args: any[]) => {
                    toggleBookmark(source, postId, status);
                    const m = method as (postId: string, ...args: any[]) => ReturnType<Provider[K]>;
                    try {
                        const result = await m.call(target.prototype, postId, ...args);
                        return result;
                    } catch (error) {
                        // revert
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
