import { first } from 'lodash-es';

import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { type Article, ArticlePlatform } from '@/providers/types/Article.js';
import { type Article as FireflyArticle } from '@/providers/types/Firefly.js';
import { WatchType } from '@/providers/types/Firefly.js';
import { parseParagraphHtml } from '@/helpers/parseParagraphHtml.js';

export function formatArticleFromFirefly(article: FireflyArticle): Article {
    const authorId = article.owner;
    return {
        platform: article.platform,
        type: article.type,
        content:
            article.platform === ArticlePlatform.Paragraph &&
            article.paragraph_raw_data?.staticHtml &&
            article.paragraph_raw_data.json
                ? parseParagraphHtml(article.paragraph_raw_data.staticHtml, article.paragraph_raw_data.json) ??
                  article.paragraph_raw_data.staticHtml
                : article.content.body,
        title: article.content.title,
        author: {
            handle: article.displayInfo.ensHandle,
            avatar: article.displayInfo.avatarUrl,
            id: authorId,
            isFollowing: article.followingSources.some(
                (x) => x.type === WatchType.Wallet && isSameEthereumAddress(x.walletAddress, authorId),
            ),
            /** Article in timeline are all not muted */
            isMuted: false,
        },
        origin: first(article.related_urls),
        id: article.article_id,
        hash: article.hash,
        timestamp: article.timestamp,
        coverUrl: article.cover_img_url,
        hasBookmarked: article.has_bookmarked,
        followingSources: article.followingSources,
        slug: article.paragraph_raw_data?.slug,
        // paragraph only
        json: article.paragraph_raw_data?.json,
    };
}
