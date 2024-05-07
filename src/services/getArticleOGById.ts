import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';

export async function getArticleOGById(id: string) {
    const article = await FireflyArticleProvider.getArticleById(id);
    if (!article) return createSiteMetadata();

    return createSiteMetadata({
        openGraph: {
            type: 'article',
            url: urlcat(SITE_URL, getArticleUrl(article)),
            title: createPageTitle(`Post by ${article.author.handle}`),
            description: article.title,
        },
        twitter: {
            card: 'summary_large_image',
            title: createPageTitle(`Post by ${article.author.handle}`),
            description: article.title,
        },
    });
}
