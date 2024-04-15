import { produce } from 'immer';

import type { SocialPlatform } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Provider, Reaction } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

const METHODS_BE_OVERRIDDEN = ['unvotePost', 'upvotePost'] as const;

export function SetQueryDataForLikePost(source: SocialPlatform) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (postId: string, authorId?: number) => {
                    const m = method as (postId: string, authorId?: number) => Promise<Reaction>;
                    const reaction = await m.call(target.prototype, postId, authorId);

                    patchPostQueryData(source, postId, (draft) => {
                        draft.hasLiked = !draft.hasLiked;
                        draft.stats = produce(draft.stats, (old) => {
                            return {
                                ...old,
                                comments: old?.comments || 0,
                                mirrors: old?.mirrors || 0,
                                reactions: (old?.reactions || 0) + (draft?.hasLiked ? 1 : -1),
                            };
                        });
                    });

                    return reaction;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
