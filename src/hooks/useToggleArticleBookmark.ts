import { t } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';

import { BookmarkType, FireflyPlatform, Source } from '@/constants/enum.js';
import { toggleBookmark } from '@/decorators/SetQueryDataForBookmarkPost.js';
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
                    toggleBookmark(Source.Article, article.id, false);
                    return result;
                } else {
                    const result = await FireflySocialMediaProvider.bookmark(
                        article.id,
                        FireflyPlatform.Article,
                        article.author.id,
                        BookmarkType.Text,
                    );
                    toggleBookmark(Source.Article, article.id, true);
                    enqueueSuccessMessage(t`Article added to your Bookmarks`);
                    return result;
                }
            } catch (error) {
                enqueueErrorMessage(hasBookmarked ? t`Failed to un-bookmark` : t`Failed to bookmark`, {
                    error,
                });
                // rolling back
                toggleBookmark(Source.Article, article.id, !!hasBookmarked);
                throw error;
            }
        },
    });
}
