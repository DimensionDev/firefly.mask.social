import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import type { Address } from 'viem';

import type { FollowingSource } from '@/providers/types/Firefly.js';

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
        /** Wallet address */
        id: Address;
        isFollowing: boolean;
        /** Article in timeline are all not muted */
        isMuted: boolean;
    };
    origin?: string;
    timestamp: string;
    id: string;
    coverUrl: string | null;
    hasBookmarked?: boolean;
    followingSources: FollowingSource[];
}

export interface Provider {
    /**
     * Retrieves recent posts in reverse chronological order.
     * @param indicator
     * @returns
     */
    discoverArticles: (indicator?: PageIndicator) => Promise<Pageable<Article, PageIndicator>>;

    /**
     * Retrieves a specific article by its ID.
     * @param articleId
     * @returns
     */
    getArticleById: (articleId: string) => Promise<Article | null>;

    /**
     * Retrieves articles that are related to following profiles.
     * @param indicator
     * @returns
     */
    getFollowingArticles: (indicator?: PageIndicator) => Promise<Pageable<Article, PageIndicator>>;
}
