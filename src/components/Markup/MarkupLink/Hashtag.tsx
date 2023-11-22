'use client';

import { memo } from 'react';
import urlcat from 'urlcat';

import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.jsx';
import { PageRoutes } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';

export const Hashtag = memo<MarkupLinkProps>(function Hashtag({ title }) {
    if (!title) return null;

    const tag = title.slice(1).toLowerCase();

    return (
        <Link className="text-link" href={urlcat(PageRoutes.Search, { q: tag })}>
            {title}
        </Link>
    );
});
