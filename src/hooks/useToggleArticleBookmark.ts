import { t } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';

import { BookmarkType, FireflyPlatform } from '@/constants/enum.js';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { LoginModalRef } from '@/modals/controls.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Article } from '@/providers/types/Article.js';

export function useToggleArticleBookmark() {
    return useMutation({
        mutationFn: async (article: Article) => {
            if (!fireflySessionHolder.session) {
                LoginModalRef.open();
                return;
            }
            const { hasBookmarked } = article;
            try {
                if (hasBookmarked) {
                    const result = await FarcasterSocialMediaProvider.unbookmark(article.id);
                    enqueueSuccessMessage(t`Article removed from your Bookmarks`);
                    return result;
                } else {
                    const result = await FarcasterSocialMediaProvider.bookmark(
                        article.id,
                        FireflyPlatform.Article,
                        article.author.id,
                        BookmarkType.Text,
                    );
                    enqueueSuccessMessage(t`Article added to your Bookmarks`);
                    return result;
                }
            } catch (error) {
                enqueueMessageFromError(
                    error,
                    hasBookmarked ? t`Failed to un-bookmark article.` : t`Failed to bookmark article.`,
                );
                throw error;
            }
        },
    });
}
