import type { FunctionComponent, SVGAttributes } from 'react';

import MirrorIon from '@/assets/mirror.xyz.svg';
import ParagraphIcon from '@/assets/paragraph.svg';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { ArticlePlatform } from '@/providers/types/Article.js';

export const resolveArticlePlatformIcon = createLookupTableResolver<
    ArticlePlatform,
    FunctionComponent<SVGAttributes<SVGElement>> | null
>(
    {
        [ArticlePlatform.Mirror]: MirrorIon,
        [ArticlePlatform.Paragraph]: ParagraphIcon,
    },
    null,
);
