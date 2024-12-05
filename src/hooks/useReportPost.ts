import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * Report a post
 */
export function useReportPost() {
    return useAsyncFn(async (post: Post) => {
        try {
            const provider = resolveSocialMediaProvider(post.source);
            const result = await provider.reportPost(post);
            if (result) {
                enqueueSuccessMessage(t`Report submitted on ${post.source}`);
            }
            return result;
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to submit report on ${post.source}.`);
            throw error;
        }
    }, []);
}
