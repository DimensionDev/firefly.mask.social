import { t } from '@lingui/macro';
import { usePathname, useRouter } from 'next/navigation.js';
import { useAsyncFn } from 'react-use';

import { type SocialSource } from '@/constants/enum.js';
import { checkFarcasterInvalidSignerKey } from '@/helpers/checkFarcasterInvalidSignerKey.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { capturePostActionEvent } from '@/providers/safary/capturePostActionEvent.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function useDeletePost(source: SocialSource) {
    const router = useRouter();
    const pathname = usePathname();
    const navBack = useComeBack();

    return useAsyncFn(
        async (post: Post) => {
            try {
                const provider = resolveSocialMediaProvider(source);
                const result = await provider.deletePost(post.postId);
                if (!result) throw new Error(`Failed to delete post: ${post.postId}`);

                if (isRoutePathname(pathname, '/post') && post.type === 'Post') {
                    navBack();
                }
                capturePostActionEvent('delete', post);
                enqueueSuccessMessage(t`Post was deleted`);
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to delete post.`), {
                    error,
                });
                checkFarcasterInvalidSignerKey(error);
                throw error;
            }
        },
        [source, router, pathname, navBack],
    );
}
