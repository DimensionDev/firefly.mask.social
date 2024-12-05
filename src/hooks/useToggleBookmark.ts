import { t } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';

import { BookmarkType, type SocialSource } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getErrorMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import { capturePostActionEvent } from '@/providers/telemetry/capturePostActionEvent.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function useToggleBookmark(source: SocialSource) {
    const isLogin = useIsLogin(source);
    return useMutation({
        mutationFn: async (post: Post) => {
            const { hasBookmarked, postId } = post;
            if (!isLogin) {
                LoginModalRef.open({ source: post.source });
                return;
            }
            try {
                const provider = resolveSocialMediaProvider(post.source);
                const result = hasBookmarked
                    ? await provider.unbookmark(postId)
                    : await provider.bookmark(postId, undefined, post.author.profileId, BookmarkType.Text);
                capturePostActionEvent(hasBookmarked ? 'unbookmark' : 'bookmark', post);
                enqueueSuccessMessage(
                    hasBookmarked ? t`Post removed from your Bookmarks` : t`Post added to your Bookmarks`,
                );
                return result;
            } catch (error) {
                enqueueErrorMessage(
                    getErrorMessageFromError(
                        error,
                        hasBookmarked ? t`Failed to un-bookmark post.` : t`Failed to bookmark post.`,
                    ),
                    {
                        error,
                    },
                );
                throw error;
            }
        },
    });
}
