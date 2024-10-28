import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';
import type { ResponseJSON } from '@/types/index.js';
import { type LinkDigested, PayloadType } from '@/types/og.js';

export async function getArticleCover(article: Article): Promise<string | null> {
    if (!article) return null;
    if (article.coverUrl) return article.coverUrl;
    if (article.platform === ArticlePlatform.Mirror && article.origin) {
        const payload = await fetchJSON<ResponseJSON<LinkDigested>>(
            urlcat(SITE_URL, '/api/oembed', {
                link: article.origin,
            }),
        );
        if (payload.success && payload.data.payload?.type === PayloadType.Mirror) {
            return payload.data.payload.cover || null;
        }
    }
    return null;
}
