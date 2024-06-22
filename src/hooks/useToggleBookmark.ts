import { t } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';

import { BookmarkType, type SocialSource } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
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
                if (hasBookmarked) {
                    const result = await provider.unbookmark(postId);
                    enqueueSuccessMessage(t`Post removed from your Bookmarks`);
                    return result;
                } else {
                    const result = await provider.bookmark(postId, undefined, post.author.profileId, BookmarkType.Text);
                    enqueueSuccessMessage(t`Post added to your Bookmarks`);
                    return result;
                }
            } catch (error) {
                enqueueErrorMessage(hasBookmarked ? t`Failed to un-bookmark` : t`Failed to bookmark`, {
                    error,
                });
                throw error;
            }
        },
    });
}
