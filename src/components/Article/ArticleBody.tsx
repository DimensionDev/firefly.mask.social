import { memo } from 'react';

import type { Article } from '@/providers/types/Article.js';

interface ArticleBodyProps {
    article: Article;
}

export const ArticleBody = memo<ArticleBodyProps>(function ArticleBody({ article }) {
    return (
        <div className="-mt-2 mb-2 break-words text-base text-main">
            <div>{article.title}</div>
        </div>
    );
});
