'use client';

import { useQuery } from '@tanstack/react-query';
import type { LinkProps } from 'next/link.js';
import { forwardRef, useCallback } from 'react';

import { Link as OriginalLink } from '@/esm/Link.js';
import { formatExternalLink } from '@/helpers/formatExternalLink.js';
import { interceptExternalUrl } from '@/helpers/interceptExternalUrl.js';
import { openWindow } from '@/helpers/openWindow.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { ConfirmLeavingModalRef } from '@/modals/controls.js';

type LinkComponent = typeof OriginalLink;

const trustedHosts = [
    'mask.io',
    'mask.notion.site',
    'localhost',
    /^([a-zA-Z0-9-]+\.)*firefly\.land$/,
    /^([a-zA-Z0-9-]+\.)*firefly\.social$/,
    /^([a-zA-Z0-9-]+\.)*mask\.social$/,
];

function isTrustedUrl(href: LinkProps['href']) {
    if (typeof href !== 'string' || !href.startsWith('http')) {
        return true;
    }

    const parsed = parseUrl(href);
    return parsed
        ? trustedHosts.some((host) => {
              return typeof host === 'string' ? host === parsed.host : host.test(parsed.host);
          })
        : true;
}

export const Link: LinkComponent = forwardRef(function Link({ href, ...rest }, ref) {
    const { data: internalLink } = useQuery({
        queryKey: ['link-transform', href],
        staleTime: Infinity,
        queryFn: async () => {
            try {
                if (typeof href !== 'string' || !href.startsWith('http')) return;
                return formatExternalLink(href);
            } catch {
                return;
            }
        },
    });

    const onLinkClick = useCallback(
        async (event: React.MouseEvent<HTMLAnchorElement>) => {
            const isTrusted = isTrustedUrl(href);
            if (!isTrusted && !internalLink && typeof href === 'string') {
                event.preventDefault();
                const intercepted = await interceptExternalUrl(href);
                if (intercepted) return;

                const confirmed = await ConfirmLeavingModalRef.openAndWaitForClose(href);
                if (confirmed) {
                    openWindow(href);
                }
            }
        },
        [internalLink, href],
    );

    return <OriginalLink {...rest} href={internalLink || href} ref={ref} onClick={onLinkClick} />;
});
