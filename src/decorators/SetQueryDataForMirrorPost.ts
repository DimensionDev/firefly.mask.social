import { v4 as uuid } from 'uuid';

import { type SocialSource, Source } from '@/constants/enum.js';
import { patchNotificationQueryDataOnPost } from '@/helpers/patchNotificationQueryData.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { type Post, type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

const lensOriginalMirrored = new Map<string, boolean>();

const METHODS_BE_OVERRIDDEN = ['mirrorPost', 'unmirrorPost'] as const;

function patchPostStats(stats: Post['stats'], status: boolean) {
    return {
        ...stats,
        comments: stats?.comments || 0,
        reactions: stats?.reactions || 0,
        mirrors: (stats?.mirrors || 0) + (status ? 1 : -1),
    };
}

function toggleMirror(source: SocialSource, postId: string, status: boolean, key?: string) {
    patchPostQueryData(source, postId, (draft) => {
        // Since lens only supports mirror and can mirror many times, rollback when the status is false.
        if (source === Source.Lens && key) {
            if (status) {
                lensOriginalMirrored.set(key, draft.hasMirrored ?? false);
                draft.hasMirrored = status;
            } else {
                const originalStatus = lensOriginalMirrored.get(key);
                draft.hasMirrored = originalStatus;
            }
        } else {
            draft.hasMirrored = status;
        }
        draft.stats = patchPostStats(draft.stats, status);
    });

    patchNotificationQueryDataOnPost(source, (post) => {
        if (post.postId === postId) {
            post.hasMirrored = status;
            post.stats = patchPostStats(post.stats, status);
        }
    });
}

export function SetQueryDataForMirrorPost(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (postId: string, ...args: unknown[]) => {
                    const status = key === 'mirrorPost';
                    const id = uuid();
                    try {
                        const m = method as (
                            postId: string,
                            ...args: unknown[]
                        ) => ReturnType<Exclude<Provider[K], undefined>>;
                        toggleMirror(source, postId, status, id);
                        const result = await m.call(target.prototype, postId, ...args);

                        return result;
                    } catch (error) {
                        // rolling back
                        toggleMirror(source, postId, !status, id);
                        throw error;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
