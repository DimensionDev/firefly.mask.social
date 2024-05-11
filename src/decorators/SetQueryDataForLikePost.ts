import { produce } from 'immer';

import type { SocialSource } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

export function toggleLike(source: SocialSource, postId: string, status: boolean) {
    patchPostQueryData(source, postId, (draft) => {
        draft.hasLiked = status;
        draft.stats = produce(draft.stats, (old) => {
            return {
                ...old,
                comments: old?.comments || 0,
                mirrors: old?.mirrors || 0,
                reactions: (old?.reactions || 0) + (status ? 1 : -1),
            };
        });
    });
}

const METHODS_BE_OVERRIDDEN = ['upvotePost', 'unvotePost'] as const;

export function SetQueryDataForLikePost(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (postId: string, ...args: unknown[]) => {
                    const status = key === 'upvotePost';
                    try {
                        toggleLike(source, postId, status);
                        const m = method as (postId: string, ...args: unknown[]) => ReturnType<Provider[K]>;
                        return await m.call(target.prototype, postId, ...args);
                    } catch (err) {
                        // rolling back
                        toggleLike(source, postId, !status);
                        throw err;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
