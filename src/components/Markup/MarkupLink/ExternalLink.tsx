'use client';

import { openWindow } from '@masknet/shared-base-ui';
import type { LinkProps } from 'next/link.js';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';

import { classNames } from '@/helpers/classNames.js';
import { formatUrl } from '@/helpers/formatUrl.js';
import { isSelfReference } from '@/helpers/isLinkMatchingHost.js';
import { parseURL } from '@/helpers/parseURL.js';

interface ExternalLinkProps extends Omit<LinkProps, 'href'> {
    title: string;
}

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({ title }) {
    const router = useRouter();
    if (!title) return null;

    const u = parseURL(title);

    return (
        <span
            className={classNames('text-link', {
                'hover:underline': !!u,
            })}
            onClick={(event) => {
                event.stopPropagation();

                if (!u) return;

                if (isSelfReference(u.href)) {
                    router.push(u.href);
                } else {
                    openWindow(u.href, '_blank');
                }
            }}
        >
            {title ? formatUrl(title, 30) : title}
        </span>
    );
});
