import { type Article, ArticlePlatform } from '@/providers/types/Article.js';

export function getArticleDigest(article?: Article) {
    if (!article) return;

    switch (article.platform) {
        case ArticlePlatform.Mirror:
            return article.id;
        case ArticlePlatform.Paragraph:
            return article.origin;
        default:
            return;
    }
}
