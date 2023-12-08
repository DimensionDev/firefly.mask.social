'use client';

import { openWindow } from '@masknet/shared-base-ui';
import type { LinkProps } from 'next/link.js';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';

import { formatUrl } from '@/helpers/formatUrl.js';

interface ExternalLinkProps extends Omit<LinkProps, 'href'> {
    title: string;
}

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({ title }) {
    const router = useRouter();
    if (!title) return null;

    const href = title.includes('://') ? title : new URL(title).href;
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
