import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { MirrorAPI } from '@/providers/mirror/index.js';
import { ParagraphAPI } from '@/providers/paragraph/index.js';
import { ArticlePlatform, type Provider } from '@/providers/types/Article.js';

export const resolveArticleCollectProvider = createLookupTableResolver<ArticlePlatform, Provider | null>(
    {
        [ArticlePlatform.Mirror]: MirrorAPI,
        [ArticlePlatform.Paragraph]: ParagraphAPI,
        [ArticlePlatform.Limo]: null,
    },
    (platform: ArticlePlatform) => {
        throw new UnreachableError('article platform', platform);
    },
);
