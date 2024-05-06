import { Source } from '@/constants/enum.js';
import { deletePostFromQueryData } from '@/helpers/deletePostFromQueryData.js';
import type { Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

export function SetQueryDataForDeletePost(source: Source) {
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
