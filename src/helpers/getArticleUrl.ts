import urlcat from 'urlcat';

import type { Article } from '@/providers/types/Article.js';

export function getArticleUrl(article: Article) {
    return urlcat('/article/:id', { id: article.id });
}
