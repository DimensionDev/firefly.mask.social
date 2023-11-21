'use client';

import { formatUrl } from '@/helpers/formatUrl.js';
import { useMounted } from '@/hooks/useMounted.js';
import { Link } from '@/esm/Link.js';
import type { LinkProps } from 'next/link.js';
import { memo } from 'react';

interface ExternalLinkProps extends Omit<LinkProps, 'href'> {
    title: string;
}

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({ title }) {
    const isMounted = useMounted();
    if (!title) return null;

    let href = title;

    if (!href.includes('://')) href = new URL(href).href;

    return (
        <Link
            href={href}
            onClick={(event) => event.stopPropagation()}
            target={isMounted && href.includes(location.host) ? '_self' : '_blank'}
            rel="noopener"
        >
            {title ? formatUrl(title, 30) : title}
        </Link>
    );
});
