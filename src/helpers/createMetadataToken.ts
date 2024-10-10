import { createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveTokenPageUrl } from '@/helpers/resolveTokenPageUrl.js';
import { Coingecko } from '@/providers/coingecko/index.js';

export async function createMetadataToken(symbol: string) {
    const tokens = await Coingecko.getTokens();
    const sym = symbol.toLowerCase();
    const token = tokens.find((x) => x.symbol === sym) || null;
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
            url: resolveTokenPageUrl(symbol),
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}
