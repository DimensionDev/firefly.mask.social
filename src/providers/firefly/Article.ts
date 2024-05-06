import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@masknet/shared-base';
import { isZero } from '@masknet/web3-shared-base';
import { first } from 'lodash-es';
import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatArticleFromFirefly } from '@/helpers/formatArticleFromFirefly.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { ArticlePlatform, type Provider } from '@/providers/types/Article.js';
import {
    type DiscoverArticlesResponse,
    type GetArticleDetailResponse,
    type GetFollowingArticlesResponse,
} from '@/providers/types/Firefly.js';

class FireflyArticle implements Provider {
    async discoverArticles(indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/discover/articles/timeline', {
            size: 20,
            platform: [ArticlePlatform.Paragraph, ArticlePlatform.Mirror].join(','),
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const response = await fetchJSON<DiscoverArticlesResponse>(url, {
            method: 'GET',
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
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/article/contents_by_ids');

        const response = await fetchJSON<GetArticleDetailResponse>(url, {
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
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/timeline/articles');

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
}

export const FireflyArticleProvider = new FireflyArticle();
