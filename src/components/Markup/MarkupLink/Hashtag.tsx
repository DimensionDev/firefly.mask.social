'use client';

import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import urlcat from 'urlcat';

import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.jsx';
import { PageRoutes } from '@/constants/enum.js';

export const Hashtag = memo<MarkupLinkProps>(function Hashtag({ title }) {
    const router = useRouter();
    if (!title) return null;

    const tag = title.slice(1).toLowerCase();

    return (
        <span
            className="text-link"
            onClick={(event) => {
                event.stopPropagation();
                router.push(urlcat(PageRoutes.Search, { q: tag }));
            }}
        >
            {title}
        </span>
    );
});
