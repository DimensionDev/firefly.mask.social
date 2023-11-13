import { MarkupLinkProps } from '@/components/Markup/MarkupLink';
import Link from 'next/link';
import urlcat from 'urlcat';
import { PageRoutes } from '@/constants/enum';

import { memo } from 'react';

export const Hashtag = memo<MarkupLinkProps>(function Hashtag({ title }) {
    if (!title) return null;

    const tag = title.slice(1).toLowerCase();

    return (
        <span className="inline-flex">
            <Link href={urlcat(PageRoutes.Search, { q: tag })}>{title}</Link>
        </span>
    );
});
