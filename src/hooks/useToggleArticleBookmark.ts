import { t } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';

import { BookmarkType } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';

export function useToggleArticleBookmark() {
    return useMutation({
        mutationFn: async (article: Article) => {
            const { hasBookmarked } = article;
            try {
                if (hasBookmarked) {
                    const result = await FireflySocialMediaProvider.unbookmark(article.id);
                    enqueueSuccessMessage(t`Article remove from your Bookmarks`);
                    return result;
                } else {
                    const result = await FireflySocialMediaProvider.bookmark(
                        article.id,
                        article.author.id,
                        BookmarkType.Text,
                    );
                    enqueueSuccessMessage(t`Article added to your Bookmarks`);
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
