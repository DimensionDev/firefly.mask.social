import type { Address } from 'viem';

import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
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
    slug?: string;
    followingSources: FollowingSource[];
}

export interface ArticleCollectable {
    quantity?: number;
    soldCount: number;
    chainId: number;
    contractAddress: string;
    price: number | null;
    isCollected: boolean;
    fee: bigint;

    // paragraph only
    symbol?: string;
    name?: string;
    ownerAddress?: string;
    referrerAddress?: string;
    postId?: string;
    position?: {
        from: number;
        to: number;
    };
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

    /**
     *
     * Retrieves article detail by its digest.
     * @param digest query id
     * @returns
     */
    getArticleCollectableByDigest: (digest: string) => Promise<ArticleCollectable>;

    /**
     * Retrieves the estimated gas fee for collecting an article.
     * @param article collectable article
     * @param account user account
     * @returns
     */
    estimateCollectGas: (article: ArticleCollectable) => Promise<bigint>;

    /**
     * Collect an article
     * @param article collectable article
     * @param account user account
     * @returns
     */
    collect: (article: ArticleCollectable) => Promise<bigint>;
}
