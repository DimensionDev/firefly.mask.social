import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Post, Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function deletePostFromQueryData(source: SocialSource, postId: string) {
    if (source === Source.Lens) {
        queryClient.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: ['posts', source] }, (old) => {
            if (!old?.pages) return old;
            return produce(old, (draft) => {
                for (const page of draft.pages) {
                    const index = page.data.findIndex((p) => p.postId === postId);
                    if (index !== -1) page.data.splice(index, 1);
                }
            });
        });
    } else {
        patchPostQueryData(source, postId, (p) => {
            p.isHidden = true;
        });
    }
}

export function SetQueryDataForDeletePost(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        const method = target.prototype.deletePost as Provider['deletePost'];

        Object.defineProperty(target.prototype, 'deletePost', {
            value: async (postId: string) => {
                const computedPostId = postId;

                const m = method as (postId: string) => Promise<boolean>;
                const result = await m?.call(target.prototype, computedPostId);

                if (postId) deletePostFromQueryData(source, postId);

                return result;
            },
        });

        return target;
    };
}
