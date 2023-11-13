import { MarkupLinkProps } from '@/components/Markup/MarkupLink';
import { formatUrl } from '@/helpers/formatUrl';
import { useMounted } from '@/hooks/useMounted';
import Link from 'next/link';
import { memo } from 'react';

export const ExternalLink = memo<MarkupLinkProps>(function ExternalLink({ title }) {
    const isMounted = useMounted();
    if (!title) return null;

    let href = title;

    if (!href.includes('://')) href = `https://${href}`;

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
