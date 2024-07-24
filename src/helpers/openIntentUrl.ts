import { safeUnreachable } from '@masknet/kit';
import { compact } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { isDomainOrSubdomainOf } from '@/helpers/isDomainOrSubdomainOf.js';
import { parseURL } from '@/helpers/parseURL.js';
import type { ComposeModalOpenProps } from '@/modals/ComposeModal.js';
import { ComposeModalRef } from '@/modals/controls.js';

enum SiteType {
    Warpcast = 'warpcast',
}

function parseSiteType(url: string) {
    if (isDomainOrSubdomainOf(url, 'warpcast.com')) {
        return SiteType.Warpcast;
    }
    return;
}

function generateComposeProps(url: string): ComposeModalOpenProps | null {
    const siteType = parseSiteType(url);
    if (!siteType) return null;

    const u = parseURL(url);

    switch (siteType) {
        case SiteType.Warpcast: {
            if (u?.pathname === '/~/compose') {
                const embeds = u.searchParams.get('embeds[]');
                const text = u.searchParams.get('text');
                return {
                    type: 'compose',
                    chars: [compact([text, embeds]).join('\n')],
                    source: [Source.Farcaster],
                };
            }
            break;
        }
        default:
            safeUnreachable(siteType);
            throw new UnreachableError('siteType', siteType);
    }
    return null;
}

export function openIntentUrl(url: string) {
    const composeProps = generateComposeProps(url);
    if (composeProps) {
        ComposeModalRef.open(composeProps);
        return true;
    }
    return false;
}
