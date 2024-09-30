'use client';

import { useRouter } from 'next/navigation.js';
import { memo, useEffect } from 'react';

import { ClickableArea } from '@/components/ClickableArea.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { PageRoute } from '@/constants/enum.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';

export const Hashtag = memo<Omit<MarkupLinkProps, 'post'>>(function Hashtag({ title, source }) {
    const router = useRouter();

    useEffect(() => {
        if (title) router.prefetch(PageRoute.Search);
    }, [title, router]);

    if (!title) return null;

    return (
        <ClickableArea
            className="cursor-pointer text-lightHighlight hover:underline"
            as="span"
            onClick={() => {
                scrollTo(0, 0);
                router.push(resolveSearchUrl(title, undefined, source));
            }}
        >
            {title}
        </ClickableArea>
    );
});
