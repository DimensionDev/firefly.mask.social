import { addLikeStatusToTweet } from '@/helpers/addLikeStatusToTwitterPost.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import type { Post, Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

const METHODS_BE_OVERRIDDEN = [
    'discoverPosts',
    'getCommentsById',
    'getLikedPostsByProfileId',
    'getRepliesPostsByProfileId',
    'searchPosts',
    'getBookmarks',
    'getPostsByProfileId',
    'getPostById',
] as const;

export function AddLikeStatusToTwitterPosts() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];
            Object.defineProperty(target.prototype, key, {
                value: async (...args: Parameters<Provider[K]>) => {
                    const m = method as unknown as (...args: Parameters<Provider[K]>) => ReturnType<Provider[K]>;
                    const result = await m.call(target.prototype, ...args);

                    const session = twitterSessionHolder.session;
                    if (!session?.profileId) return result;

                    // add like status to `Promise<Post>`
                    if (result && typeof result === 'object' && !('data' in result)) {
                        return addLikeStatusToTweet(session.profileId, result as Post);
                    }

                    // add like status to `Promise<Pageable<Post, PageIndicator>>`
                    if (
                        result &&
                        typeof result === 'object' &&
                        'data' in result &&
                        Array.isArray(result.data) &&
                        result.data.length > 0
                    ) {
                        return {
                            ...result,
                            data: result.data.map((post: Post) => addLikeStatusToTweet(session.profileId, post)),
                        };
                    }

                    return result;
                },
            });
        }
        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
