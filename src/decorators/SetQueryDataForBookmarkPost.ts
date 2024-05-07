import { produce } from 'immer';

import type { SocialSource } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

export function toggleBookmark(source: SocialSource, postId: string) {
    patchPostQueryData(source, postId, (draft) => {
        draft.hasBookmarked = !draft.hasBookmarked;
        draft.stats = produce(draft.stats, (old) => {
            return {
                ...old,
                comments: old?.comments || 0,
                mirrors: old?.mirrors || 0,
                reactions: old?.reactions || 0,
                bookmarks: (old?.bookmarks || 0) + (draft.hasBookmarked ? 1 : -1),
            };
        });
    });
}

const METHODS_BE_OVERRIDDEN = ['bookmark', 'unbookmark'] as const;

export function SetQueryDataForBookmarkPost(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (postId: string) => {
                    toggleBookmark(source, postId);
                    const m = method as (postId: string) => ReturnType<Provider[K]>;
                    try {
                        const result = await m.call(target.prototype, postId);
                        return result;
                    } catch (error) {
                        // revert
                        toggleBookmark(source, postId);
                        throw error;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
