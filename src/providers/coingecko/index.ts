import { uniq, uniqBy } from 'lodash-es';
import urlcat from 'urlcat';

import { COINGECKO_URL_BASE, CORS_HOST, DSEARCH_BASE_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveCoinGeckoChainId } from '@/helpers/resolveCoingeckoChainId.js';
import { getCommunityLink } from '@/helpers/trending.js';
import type { CoingeckoCoinInfo, CoingeckoPlatform, CoingeckoToken } from '@/providers/types/Coingecko.js';
import { type Contract, type Trending, TrendingProvider } from '@/providers/types/Trending.js';

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
    static getCoinInfo(coinId: string) {
        type CoinInfoResponse =
            | CoingeckoCoinInfo
            | {
                  error: string;
              };
        return fetchJSON<CoinInfoResponse>(
            urlcat(COINGECKO_URL_BASE, `/coins/${coinId}`, {
                developer_data: false,
                community_data: false,
                tickers: true,
            }),
        );
    }
    private static async getSupportedPlatforms() {
        const response = await fetchJSON<CoingeckoPlatform[]>(`${COINGECKO_URL_BASE}/asset_platforms`);
        return response.filter((x) => x.id && x.chain_identifier) ?? [];
    }

    static async getCoinTrending(coinId: string): Promise<Trending> {
        const info = await this.getCoinInfo(coinId);
        if ('error' in info) throw new Error(info.error);

        const platform_url = `https://www.coingecko.com/en/coins/${info.id}`;
        const twitter_url = info.links.twitter_screen_name
            ? `https://twitter.com/${info.links.twitter_screen_name}`
            : '';
        const facebook_url = info.links.facebook_username ? `https://facebook.com/${info.links.facebook_username}` : '';
        const telegram_url = info.links.telegram_channel_identifier
            ? `https://t.me/${info.links.telegram_channel_identifier}`
            : '';

        const platforms = await this.getSupportedPlatforms();
        return {
            lastUpdated: info.last_updated,
            provider: TrendingProvider.Coingecko,
            contracts:
                coinId === 'avalanche-2'
                    ? [
                          { address: '0x1ce0c2827e2ef14d5c4f29a091d735a204794041', chainId: 56, runtime: 'ethereum' },
                          { address: '0x4792c1ecb969b036eb51330c63bd27899a13d84e', chainId: 1284, runtime: 'ethereum' },
                      ]
                    : (Object.entries(info.platforms)
                          .map(([runtime, address]) => ({
                              chainId:
                                  platforms.find((x) => x.id === runtime)?.chain_identifier ??
                                  resolveCoinGeckoChainId(runtime),
                              address,
                              runtime,
                          }))
                          .filter((x) => x.address) as Contract[]),
            coin: {
                id: coinId,
                name: info.name,
                symbol: info.symbol.toUpperCase(),
                type: 'Fungible',
                description: info.description.en,
                market_cap_rank: info.market_cap_rank,
                image_url: info.image.small,
                tags: info.categories.filter(Boolean),
                announcement_urls: info.links.announcement_url.filter(Boolean),
                community_urls: getCommunityLink(
                    uniqBy(
                        [
                            twitter_url,
                            facebook_url,
                            telegram_url,
                            info.links.subreddit_url,
                            ...info.links.chat_url,
                            ...info.links.official_forum_url,
                        ].filter(Boolean),
                        (x) => x.toLowerCase(),
                    ),
                ),
                source_code_urls: Object.values(info.links.repos_url).flatMap((x) => x),
                home_urls: info.links.homepage.filter(Boolean),
                blockchain_urls: uniq(
                    [platform_url, ...info.links.blockchain_site].filter(Boolean).map((url) => url.toLowerCase()),
                ),
                platform_url,
                facebook_url,
                twitter_url,
                telegram_url,
                contract_address: info.contract_address,
            },
            market: (() => {
                const entries = Object.entries(info.market_data).map(([key, value]) => {
                    if (value && typeof value === 'object') {
                        return [key, value.usd ?? 0];
                    }
                    return [key, value];
                });
                return Object.fromEntries(entries);
            })(),
            tickers: info.tickers.slice(0, 30).map((x) => ({
                logo_url: x.market.logo,
                trade_url: x.trade_url,
                market_name: x.market.name,
                base_name: x.base,
                target_name: x.target,
                price: x.converted_last.usd,
                volume: x.converted_volume.usd,
                score: x.trust_score,
                updated: new Date(x.timestamp),
            })),
        };
    }
}
