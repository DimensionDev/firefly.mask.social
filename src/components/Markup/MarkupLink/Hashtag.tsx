'use client';

import { useRouter } from 'next/navigation.js';
import { memo, useEffect } from 'react';
import urlcat from 'urlcat';

import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { PageRoutes } from '@/constants/enum.js';

export const Hashtag = memo<Omit<MarkupLinkProps, 'post'>>(function Hashtag({ title }) {
    const router = useRouter();

    useEffect(() => {
        if (title) router.prefetch(PageRoutes.Search);
    }, [title, router]);

    if (!title) return null;

    const tag = title.slice(1).toLowerCase();

    return (
        <span
            className="text-link"
            onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                router.push(urlcat(PageRoutes.Search, { q: tag }));
            }}
        >
            {title}
        </span>
    );
});
