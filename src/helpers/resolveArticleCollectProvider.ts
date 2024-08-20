import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { MirrorAPI } from '@/providers/mirror/index.js';
import { ParagraphAPI } from '@/providers/paragraph/index.js';
import { type ArticleCollectProvider, ArticlePlatform } from '@/providers/types/Article.js';

export const resolveArticleCollectProvider = createLookupTableResolver<ArticlePlatform, ArticleCollectProvider>(
    {
        [ArticlePlatform.Mirror]: MirrorAPI,
        [ArticlePlatform.Paragraph]: ParagraphAPI,
    },
    (platform: ArticlePlatform) => {
        throw new UnreachableError('article platform', platform);
    },
);
