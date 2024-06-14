import urlcat from 'urlcat';

import { COINGECKO_URL_BASE, CORS_HOST, DSEARCH_BASE_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { CoingeckoToken } from '@/providers/types/Coingecko.js';

export class Coingecko {
    static getTokens() {
        const url = urlcat(DSEARCH_BASE_URL, '/fungible-tokens/coingecko.json');
        return fetchJSON<CoingeckoToken[]>(`${CORS_HOST}?${encodeURIComponent(url)}`, { mode: 'cors' });
    }
    static async getTokenPrice(coinId: string): Promise<number | undefined> {
        const url = urlcat(COINGECKO_URL_BASE, '/simple/price', { ids: coinId, vs_currencies: 'usd' });
        const price = await fetchJSON<Record<string, Record<string, number>>>(url);
        return price[coinId]?.usd;
    }

    static async getPriceStats(coinId: string, days?: number) {
        type Stat = [number, number];
        const url = urlcat(COINGECKO_URL_BASE, `/coins/${coinId}/market_chart`, {
            vs_currency: 'usd',
            days: days || 11430,
        });
        return fetchJSON<{
            market_caps: Stat[];
            prices: Stat[];
            total_volumes: Stat[];
        }>(url);
    }
}
