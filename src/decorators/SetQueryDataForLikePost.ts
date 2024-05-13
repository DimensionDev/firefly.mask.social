import type { SocialSource } from '@/constants/enum.js';
import { patchNotificationQueryDataOnPost } from '@/helpers/patchNotificationQueryData.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { type Post, type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function patchPostStats(stats: Post['stats'], status: boolean) {
    return {
        ...stats,
        comments: stats?.comments || 0,
        mirrors: stats?.mirrors || 0,
        reactions: (stats?.reactions || 0) + (status ? 1 : -1),
    };
}

export function toggleLike(source: SocialSource, postId: string, status: boolean) {
    patchPostQueryData(source, postId, (draft) => {
        draft.hasLiked = status;
        draft.stats = patchPostStats(draft.stats, status);
    });

    patchNotificationQueryDataOnPost(source, (post) => {
        if (post.postId === postId) {
            post.hasLiked = status;
            post.stats = patchPostStats(post.stats, status);
        }
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
