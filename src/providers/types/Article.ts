import type { Pageable, PageIndicator } from '@masknet/shared-base';

export enum ArticlePlatform {
    Mirror = 'mirror',
    Paragraph = 'paragraph',
}

export enum ArticleType {
    Post = 'post',
    Revise = 'revise',
}

export interface Article {
    platform: ArticlePlatform;
    title: string;
    content: string;
    type: ArticleType;
    hash: string;
    author: {
        handle: string;
        avatar: string;
        id: string;
    };
    origin?: string;
    timestamp: string;
    id: string;
    coverUrl: string | null;
}

export interface Provider {
    discoverArticles: (indicator?: PageIndicator) => Promise<Pageable<Article, PageIndicator>>;

    getArticleDetailById: (articleId: string) => Promise<Article | null>;

    getFollowingArticles: (indicator?: PageIndicator) => Promise<Pageable<Article, PageIndicator>>;
}
