import { parseHTML } from 'linkedom';
import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import { getArticleCover } from '@/services/getArticleCover.js';

export async function createMetadataArticleById(id: string) {
    const article = await FireflyArticleProvider.getArticleById(id);
    if (!article) return createSiteMetadata();
    const coverUrl = await getArticleCover(article).catch(() => null);
    const images = coverUrl ? [coverUrl] : undefined;
    const title = createPageTitleOG(article.title);
    const html = parseHTML(`<html><body>${article.content}</body></html>`);
    const description = html.document.body.innerText;

    return createSiteMetadata({
        title,
        description,
        openGraph: {
            type: 'article',
            url: urlcat(SITE_URL, getArticleUrl(article)),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    });
}
