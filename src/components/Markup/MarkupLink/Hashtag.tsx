'use client';

import { useRouter } from 'next/navigation.js';
import { memo, useEffect } from 'react';
import urlcat from 'urlcat';

import { ClickableArea } from '@/components/ClickableArea.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { PageRoute, SearchType, Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export const Hashtag = memo<Omit<MarkupLinkProps, 'post'>>(function Hashtag({ title, source }) {
    const router = useRouter();

    useEffect(() => {
        if (title) router.prefetch(PageRoute.Search);
    }, [title, router]);

    if (!title) return null;

    // Twitter hashtags are not supported in search.
    const disabled = source === Source.Twitter;

    return (
        <ClickableArea
            className={classNames({
                'cursor-pointer text-lightHighlight hover:underline': !disabled,
            })}
            as="span"
            disabled={disabled}
            onClick={() => {
                scrollTo(0, 0);
                router.push(
                    urlcat(PageRoute.Search, {
                        q: title,
                        type: SearchType.Posts,
                        source: source ? resolveSourceInURL(source) : undefined,
                    }),
                );
            }}
        >
            {title}
        </ClickableArea>
    );
});
