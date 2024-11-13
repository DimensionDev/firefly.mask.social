import { first } from 'lodash-es';

import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import { CoinGecko } from '@/providers/coingecko/index.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { CoingeckoCoinMarketInfo } from '@/providers/types/CoinGecko.js';
import type { SearchableToken } from '@/providers/types/Firefly.js';

export type TokenWithMarket = SearchableToken & { market?: CoingeckoCoinMarketInfo; hit?: boolean };

function isSameTokenSymbol(symbol: string, keyword: string) {
    return symbol.toLowerCase() === keyword.replace(/^\$/, '').toLowerCase();
}

function sortTokensByKeyword(tokens: SearchableToken[], keyword: string) {
    // fast path
    if (isSameTokenSymbol(tokens[0]?.symbol || '', keyword)) {
        const [firstToken, ...rest] = tokens;
        return [{ ...firstToken, hit: true }, ...rest];
    }

    const matchedToken = first(
        tokens
            .filter((x) => isSameTokenSymbol(x.symbol, keyword))
            .sort((a, b) => {
                if (!a.market_cap_rank || !b.market_cap_rank) {
                    return 0;
                }
                return a.market_cap_rank - b.market_cap_rank;
            }),
    );

    if (matchedToken) {
        return [{ ...matchedToken, hit: true }, ...tokens];
    }

    return tokens;
}

export async function searchTokens(searchKeyword: string): Promise<Pageable<TokenWithMarket, PageIndicator>> {
    const res = await FireflyEndpointProvider.searchTokens(searchKeyword);
    const ids = res.data.map((x) => x.id);
    const marketData = await CoinGecko.getCoinsByIds(ids);

    return {
        ...res,
        data: sortTokensByKeyword(res.data || [], searchKeyword).map((x) => ({
            ...x,
            market: marketData.find((market) => market.id === x.id),
        })),
    };
}
