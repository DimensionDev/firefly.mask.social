import { isSameAddress } from '@masknet/web3-shared-base';
import { first } from 'lodash-es';

import type { Article } from '@/providers/types/Article.js';
import { type Article as FireflyArticle } from '@/providers/types/Firefly.js';
import { WatchType } from '@/providers/types/Firefly.js';

export function formatArticleFromFirefly(article: FireflyArticle): Article {
    const authorId = article.owner;
    return {
        platform: article.platform,
        type: article.type,
        content: article.content.body,
        title: article.content.title,
        author: {
            handle: article.displayInfo.ensHandle,
            avatar: article.displayInfo.avatarUrl,
            id: authorId,
            isFollowing: article.followingSources.some(
                (x) => x.type === WatchType.Wallet && isSameAddress(x.walletAddress, authorId),
            ),
            /** Article in timeline are all unmuted */
            isMuted: false,
        },
        origin: first(article.related_urls),
        id: article.article_id,
        hash: article.hash,
        timestamp: article.timestamp,
        coverUrl: article.cover_img_url,
        hasBookmarked: article.has_bookmarked,
    };
}
