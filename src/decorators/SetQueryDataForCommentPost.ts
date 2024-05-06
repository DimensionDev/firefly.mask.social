import { produce } from 'immer';

import { Source } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Post, Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function commentPost(source: Source, postId: string) {
    patchPostQueryData(source, postId, (draft) => {
        draft.stats = produce(draft.stats, (old) => {
            return {
                ...old,
                comments: (old?.comments || 0) + 1,
                mirrors: old?.mirrors || 0,
                reactions: old?.reactions || 0,
            };
        });
    });
}

export function SetQueryDataForCommentPost(source: Source) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        const method = target.prototype.commentPost as Provider['commentPost'];

        Object.defineProperty(target.prototype, 'commentPost', {
            value: async (postId: string, post: Post, ...args: unknown[]) => {
                const computedPostId = postId || post.commentOn?.postId || '';

                const m = method as (postId: string, post: Post, ...args: unknown[]) => Promise<string>;
                const result = await m?.call(target.prototype, computedPostId, post, ...args);

                if (computedPostId) commentPost(source, computedPostId);

                return result;
            },
        });

        return target;
    };
}
