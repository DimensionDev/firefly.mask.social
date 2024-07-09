import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@/helpers/pageable.js';
import { isZero } from '@masknet/web3-shared-base';
import { compact, first } from 'lodash-es';
import urlcat from 'urlcat';

import { BookmarkType, FireflyPlatform } from '@/constants/enum.js';
import { formatArticleFromFirefly } from '@/helpers/formatArticleFromFirefly.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { type Article, ArticlePlatform, type Provider } from '@/providers/types/Article.js';
import {
    type Article as FFArticle,
    type BookmarkResponse,
    type DiscoverArticlesResponse,
    type GetArticleDetailResponse,
    type GetFollowingArticlesResponse,
} from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

class FireflyArticle implements Provider {
    async discoverArticles(indicator?: PageIndicator) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/discover/articles/timeline', {
            size: 20,
            platform: [ArticlePlatform.Paragraph, ArticlePlatform.Mirror].join(','),
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const response = await fireflySessionHolder.fetch<DiscoverArticlesResponse>(url);

        const data = resolveFireflyResponseData(response);

        const articles = data.result.map(formatArticleFromFirefly);

        return createPageable(
            articles,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    async discoverArticlesByAddress(address: string, indicator?: PageIndicator) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/timeline/articles');

        const response = await fireflySessionHolder.fetch<DiscoverArticlesResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                platform: [ArticlePlatform.Paragraph, ArticlePlatform.Mirror].join(','),
                walletAddresses: [address],
                size: 20,
                cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
            }),
        });

        const data = resolveFireflyResponseData(response);

        const articles = data.result.map(formatArticleFromFirefly);

        return createPageable(
            articles,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    async getArticleById(articleId: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/article/contents_by_ids');

        const response = await fireflySessionHolder.fetch<GetArticleDetailResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                ids: [articleId],
            }),
        });

        const data = resolveFireflyResponseData(response);

        const article = first(data);
        if (!article) return null;

        return formatArticleFromFirefly(article);
    }

    async getFollowingArticles(indicator?: PageIndicator) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/timeline/articles');
        const response = await fireflySessionHolder.fetch<GetFollowingArticlesResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                size: 20,
                cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
            }),
        });

        const data = resolveFireflyResponseData(response);

        const articles = data.result.map(formatArticleFromFirefly);

        return createPageable(
            articles,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    async getBookmarks(indicator?: PageIndicator): Promise<Pageable<Article, PageIndicator>> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/bookmark/find', {
            post_type: BookmarkType.All,
            platforms: FireflyPlatform.Article,
            limit: 25,
            cursor: indicator?.id || undefined,
        });
        const response = await fireflySessionHolder.fetch<BookmarkResponse<FFArticle>>(url);

        const posts = compact(
            response.data?.list.map((x) => (x.post_content ? formatArticleFromFirefly(x.post_content) : null)),
        );

        return createPageable(
            posts,
            createIndicator(indicator),
            response.data?.cursor ? createNextIndicator(indicator, `${response.data.cursor}`) : undefined,
        );
    }
}

export const FireflyArticleProvider = new FireflyArticle();
