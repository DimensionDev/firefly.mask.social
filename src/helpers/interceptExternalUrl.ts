import { safeUnreachable } from '@masknet/kit';
import { compact } from 'lodash-es';

import { ExternalSiteDomain, Source } from '@/constants/enum.js';
import { isDomainOrSubdomainOf } from '@/helpers/isDomainOrSubdomainOf.js';
import { openWindow } from '@/helpers/openWindow.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { getArticleIdFromUrl } from '@/services/getArticleIdFromUrl.js';

function parseSiteType(url: string) {
    return Object.values(ExternalSiteDomain).find((domain) => isDomainOrSubdomainOf(url, domain));
}

function formatExternalUrl(url: string) {
    const siteType = parseSiteType(url);
    if (!siteType) return null;

    const parsedURL = parseUrl(url);
    if (!parsedURL) return null;

    return { siteType, parsedURL };
}

async function formatWarpcastUrl(parsedURL: URL) {
    switch (parsedURL.pathname) {
        case '/~/compose': {
            const embeds = parsedURL.searchParams.get('embeds[]');
            const text = parsedURL.searchParams.get('text');
            ComposeModalRef.open({
                type: 'compose',
                chars: [compact([text, embeds]).join('\n')],
                source: [Source.Farcaster],
            });
            return true;
        }
        case '/~/composer-action': {
            const actionUrl = parseUrl(parsedURL.searchParams.get('url') || '');
            const articleId = await getArticleIdFromUrl(actionUrl?.searchParams.get('url') || '');
            if (!articleId) return false;

            openWindow(`/article/${articleId}`);
            return true;
        }
        default:
            return false;
    }
}

export async function interceptExternalUrl(url: string) {
    const { siteType, parsedURL } = formatExternalUrl(url) ?? {};
    if (!siteType || !parsedURL) return false;

    switch (siteType) {
        case ExternalSiteDomain.Warpcast:
            return await formatWarpcastUrl(parsedURL);
        default:
            safeUnreachable(siteType);
            return false;
    }
}
