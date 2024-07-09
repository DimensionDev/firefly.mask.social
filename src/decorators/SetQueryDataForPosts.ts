import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import type { Post, Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

const METHODS_BE_OVERRIDDEN = [
    'searchPosts',
    'discoverPosts',
    'discoverPostsById',
    'getCommentsById',
    'getPostsByProfileId',
] as const;

export function SetQueryDataForPosts<T extends ClassType<Provider>>(target: T): T {
    function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
        const method = target.prototype[key] as Provider[K];

        Object.defineProperty(target.prototype, key, {
            value: async (...args: Parameters<Provider[K]>) => {
                const m = method as (...args: Parameters<Provider[K]>) => Promise<Pageable<Post, PageIndicator>>;
                const result = await m.apply(target.prototype, args);

                result.data.forEach((post) => {
                    queryClient.setQueryData([post.source, 'post-detail', post.postId], post);
                    if (post.source !== Source.Farcaster) {
                        queryClient.setQueryData(['profile', post.source, post.author.profileId], post.author);
                        queryClient.setQueryData(['profile', post.source, post.author.handle], post.author);
                    }
                });

                return result;
            },
        });
    }

    METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

    return target;
}
