import { useAsyncFn } from 'react-use';

import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * Report a user
 */
export function useReportPost(post: Post) {
    return useAsyncFn(async () => {
        const provider = resolveSocialMediaProvider(post.source);
        const result = await provider.reportPost(post);
        return result;
    }, []);
}
