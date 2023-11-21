'use client';

import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.jsx';
import { Link } from '@/esm/Link.js';
import urlcat from 'urlcat';
import { PageRoutes } from '@/constants/enum.js';

import { memo } from 'react';

export const Hashtag = memo<MarkupLinkProps>(function Hashtag({ title }) {
    if (!title) return null;

    const tag = title.slice(1).toLowerCase();

    return (
        <Link className="text-link" href={urlcat(PageRoutes.Search, { q: tag })}>
            {title}
        </Link>
    );
});
