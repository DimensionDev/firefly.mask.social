import { first } from 'lodash-es';

import type { Article as FireflyArticle } from '@/providers/types/Firefly.js';
import type { Article } from '@/providers/types/SocialMedia.js';

export function formatArticleFromFirefly(article: FireflyArticle): Article {
    return {
        platform: article.platform,
        type: article.type,
        content: article.content.body,
        title: article.content.title,
        author: {
            handle: article.displayInfo.ensHandle,
            avatar: article.displayInfo.avatarUrl,
            id: article.owner,
        },
        origin: first(article.related_urls),
        id: article.article_id,
        hash: article.hash,
        timestamp: article.timestamp,
    };
}
