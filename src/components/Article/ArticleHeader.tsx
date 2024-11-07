'use client';
import { memo } from 'react';

import { ArticleActions } from '@/components/Article/ArticleActions.js';
import { ArticleAuthor } from '@/components/Article/ArticleAuthor.js';
import { NoSSR } from '@/components/NoSSR.js';
import { classNames } from '@/helpers/classNames.js';
import type { Article } from '@/providers/types/Article.js';

interface ArticleHeaderProps {
    article: Article;
    className?: string;
}
export const ArticleHeader = memo<ArticleHeaderProps>(function ArticleHeader({ article, className }) {
    return (
        <div
            className={classNames(
                'flex items-center justify-between border-b border-secondaryLine pb-[10px]',
                className,
            )}
        >
            <ArticleAuthor article={article} />
            <NoSSR>
                <ArticleActions article={article} />
            </NoSSR>
        </div>
    );
});
