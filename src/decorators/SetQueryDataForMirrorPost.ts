import { type SocialSource, Source } from '@/constants/enum.js';
import { patchNotificationQueryDataOnPost } from '@/helpers/patchNotificationQueryData.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { type Post, type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function patchPostStats(stats: Post['stats'], status: boolean) {
    return {
        ...stats,
        comments: stats?.comments || 0,
        reactions: stats?.reactions || 0,
        mirrors: (stats?.mirrors || 0) + (status ? 1 : -1),
    };
}

function toggleMirror(source: SocialSource, postId: string, status: boolean) {
    patchPostQueryData(source, postId, (draft) => {
        // You can mirror many times on Lens.
        const mirrored = source === Source.Lens || status;
        draft.hasMirrored = mirrored;
        draft.stats = patchPostStats(draft.stats, mirrored);
    });

    patchNotificationQueryDataOnPost(source, (post) => {
        if (post.postId === postId) {
            post.hasMirrored = status;
            post.stats = patchPostStats(post.stats, status);
        }
    });
}

const METHODS_BE_OVERRIDDEN = ['mirrorPost', 'unmirrorPost'] as const;

export function SetQueryDataForMirrorPost(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (postId: string, ...args: unknown[]) => {
                    const m = method as (
                        postId: string,
                        ...args: unknown[]
                    ) => ReturnType<Exclude<Provider[K], undefined>>;
                    toggleMirror(source, postId, key === 'mirrorPost');
                    const result = await m.call(target.prototype, postId, ...args);

                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
