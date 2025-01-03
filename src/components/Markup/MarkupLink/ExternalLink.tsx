'use client';

import type { LinkProps } from 'next/link.js';
import { memo } from 'react';

import { Link } from '@/components/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatUrl } from '@/helpers/formatUrl.js';
import { isSelfReference } from '@/helpers/isLinkMatchingHost.js';
import { isTopLevelDomain } from '@/helpers/isTopLevelDomain.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { stopPropagation } from '@/helpers/stopEvent.js';

interface ExternalLinkProps extends Omit<LinkProps, 'href'> {
    title: string;
}

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({ title }) {
    if (!title) return null;

    const u = parseUrl(title);
    if (!u || !isTopLevelDomain(u)) return <span>{title}</span>;

    return (
        <Link
            onClick={stopPropagation}
            href={u.href}
            title={u.href}
            className={classNames('text-highlight', {
                'hover:underline': !!u,
            })}
            target={!isSelfReference(u.href) ? '_blank' : '_self'}
        >
            {title ? formatUrl(title, 30) : title}
        </Link>
    );
});
