import { createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveTokenPageUrl } from '@/helpers/resolveTokenPageUrl.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { getTokenFromCoinGecko } from '@/services/getTokenFromCoinGecko.js';

export async function createMetadataToken(symbol: string) {
    const token = await runInSafeAsync(() => getTokenFromCoinGecko(symbol));
    if (!token) return createSiteMetadata();
    const title = createPageTitleOG(`$${token.symbol}`);
    const description = token.name;
    const images = token.logoURL ? [token.logoURL] : [];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            url: resolveTokenPageUrl(token.id),
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}
