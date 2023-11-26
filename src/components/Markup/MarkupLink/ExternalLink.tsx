'use client';

import type { LinkProps } from 'next/link.js';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';

import { formatUrl } from '@/helpers/formatUrl.js';
import { openWindow } from '@/maskbook/packages/shared-base-ui/src/index.js';

interface ExternalLinkProps extends Omit<LinkProps, 'href'> {
    title: string;
}

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({ title }) {
    const router = useRouter();
    if (!title) return null;

    let href = title;

    if (!href.includes('://')) href = new URL(href).href;

    return (
        <span
            className="text-link"
            onClick={(event) => {
                event.stopPropagation();
                if (href.includes(location.host)) {
                    router.push(href);
                } else {
                    openWindow(href, '_blank');
                }
            }}
        >
            {title ? formatUrl(title, 30) : title}
        </span>
    );
});
