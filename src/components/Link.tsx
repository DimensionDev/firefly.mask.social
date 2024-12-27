'use client';

import { forwardRef, useCallback, useMemo } from 'react';

import { Link as OriginalLink } from '@/esm/Link.js';
import { formatExternalLink } from '@/helpers/formatExternalLink.js';
import { openWindow } from '@/helpers/openWindow.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { ConfirmLeavingModalRef } from '@/modals/controls.js';

type LinkComponent = typeof OriginalLink;

const trustedHosts = [
    'beta.mask.social',
    'alpha.mask.social',
    'cz.firefly.social',
    'firefly-canary.mask.social',
    'firefly-staging.mask.social',
    'app.firefly.land',
    'mask.social',
    'firefly.mask.social',
    'mask.io',
    'mask.notion.site',
    'localhost',
];

export const Link: LinkComponent = forwardRef(function Link({ href, ...rest }, ref) {
    const { link, isTrusted } = useMemo(() => {
        if (typeof href !== 'string' || !/^https?/.test(href)) {
            return { link: href, isTrusted: true };
        }

        const parsed = parseUrl(href);

        return { link: formatExternalLink(href), isTrusted: !!parsed && trustedHosts.includes(parsed.host) };
    }, [href]);

    const onLinkClick = useCallback(
        async (event: React.MouseEvent<HTMLAnchorElement>) => {
            if (!isTrusted && typeof link === 'string') {
                event.preventDefault();
                const confirmed = await ConfirmLeavingModalRef.openAndWaitForClose(link);
                if (confirmed) {
                    openWindow(link);
                }
            }
        },
        [isTrusted, link],
    );

    return <OriginalLink {...rest} href={link} ref={ref} onClick={onLinkClick} />;
});
