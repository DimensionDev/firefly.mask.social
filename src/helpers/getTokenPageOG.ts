import { createPageTitleV2 } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveTokenPageUrl } from '@/helpers/resolveTokenPageUrl.js';
import { Coingecko } from '@/providers/coingecko/index.js';

export async function getTokenPageOG(symbol: string) {
    const tokens = await Coingecko.getTokens();
    const sym = symbol.toLowerCase();
    const token = tokens.find((x) => x.symbol === sym) || null;
    if (!token) return createSiteMetadata();
    const title = createPageTitleV2(token.symbol);
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
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    });
}
