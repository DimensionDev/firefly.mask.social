import { SingleArticle, type SingleArticleProps } from '@/components/Article/SingleArticle.js';
import type { Article } from '@/providers/types/SocialMedia.js';

export function getArticleItemContent(
    index: number,
    article: Article,
    listKey?: string,
    postProps?: Partial<SingleArticleProps>,
) {
    return (
        <SingleArticle
            article={article}
            key={`${article.hash}-${index}`}
            listKey={listKey}
            index={index}
            {...postProps}
        />
    );
}
