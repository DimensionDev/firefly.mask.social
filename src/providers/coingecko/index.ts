import { ChainId, getCoinGeckoConstants, isNativeTokenAddress, isValidAddress } from '@masknet/web3-shared-evm';
import { uniq, uniqBy } from 'lodash-es';
import urlcat from 'urlcat';

import { TrendingType } from '@/constants/enum.js';
import { COINGECKO_URL_BASE, CORS_HOST, DSEARCH_BASE_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getCommunityLink } from '@/helpers/getCommunityLink.js';
import { resolveCoinGeckoChainId } from '@/helpers/resolveCoinGeckoChainId.js';
import type {
    CoinGeckoCoinInfo,
    CoinGeckoCoinMarketInfo,
    CoinGeckoCoinTrending,
    CoinGeckoGainsLoserInfo,
    CoinGeckoMemeCoinTrending,
    CoinGeckoPlatform,
    CoinGeckoToken,
    Price,
} from '@/providers/types/CoinGecko.js';
import { type Contract, type Trending, TrendingProvider } from '@/providers/types/Trending.js';
import type { TokenWithMarket } from '@/services/searchTokens.js';

function formatGainsOrLoser(info: CoinGeckoGainsLoserInfo): TokenWithMarket {
    return {
        api_symbol: info.symbol,
        id: info.id,
        name: info.name,
        large: info.image,
        market_cap_rank: info.market_cap_rank,
        symbol: info.symbol,
        thumb: info.image,
        market: {
            current_price: info.usd,
            price_change_percentage_24h: info.usd_24h_change,
        },
    };
}

export class CoinGecko {
    static getTokens() {
        const url = urlcat(DSEARCH_BASE_URL, '/fungible-tokens/coingecko.json');
        return fetchJSON<CoinGeckoToken[]>(`${CORS_HOST}?${encodeURIComponent(url)}`, { mode: 'cors' });
    }

    static async getTokenPrice(coinId: string): Promise<number | undefined> {
        const url = urlcat(COINGECKO_URL_BASE, '/simple/price', { ids: coinId, vs_currencies: 'usd' });
        const price = await fetchJSON<Record<string, Record<string, number>>>(url);
        return price[coinId]?.usd;
    }

    static getFungibleTokenPrice(chainId: ChainId, address: string) {
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(chainId);

        if (isNativeTokenAddress(address) || !isValidAddress(address)) {
            return CoinGecko.getTokenPrice(COIN_ID);
        }
        return CoinGecko.getTokenPriceByAddress(PLATFORM_ID, address);
    }

    static async getTokenPriceByAddress(platform_id: string, address: string) {
        const price = await CoinGecko.getTokenPrices(platform_id, [address]);
        const currencies = price[address.toLowerCase()];
        return currencies?.usd ? Number(currencies.usd) : undefined;
    }

    static async getTokenPrices(platform_id: string, contractAddresses: string[]) {
        const url = urlcat(COINGECKO_URL_BASE, '/simple/token_price/:platform_id', {
            platform_id,
            contract_addresses: contractAddresses.join(','),
            vs_currencies: 'usd',
        });

        return fetchJSON<Record<string, Price>>(url);
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
            | CoinGeckoCoinInfo
            | {
                  error: string;
              };
        return fetchJSON<CoinInfoResponse>(
            urlcat(COINGECKO_URL_BASE, `/coins/${coinId}`, {
                developer_data: false,
                community_data: false,
                localization: false,
            }),
        );
    }
    private static async getSupportedPlatforms() {
        const response = await fetchJSON<CoinGeckoPlatform[]>(`${COINGECKO_URL_BASE}/asset_platforms`);
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
            provider: TrendingProvider.CoinGecko,
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
        };
    }

    static async getCoinsByIds(coinIds: string[]) {
        return fetchJSON<CoinGeckoCoinMarketInfo[]>(
            urlcat(COINGECKO_URL_BASE, '/coins/markets', {
                ids: coinIds.join(','),
                vs_currency: 'usd',
                per_page: 250,
                page: 1,
            }),
        );
    }

    static async getTopGainersOrLosers(
        type: TrendingType.TopGainers | TrendingType.TopLosers,
    ): Promise<TokenWithMarket[]> {
        const response = await fetchJSON<{
            top_gainers: CoinGeckoGainsLoserInfo[];
            top_losers: CoinGeckoGainsLoserInfo[];
        }>(urlcat(COINGECKO_URL_BASE, '/coins/top_gainers_losers', { vs_currency: 'usd' }));

        const data = type === TrendingType.TopGainers ? response.top_gainers : response.top_losers;
        return data.map(formatGainsOrLoser);
    }

    static async getTopTrendingCoins() {
        const response = await fetchJSON<{ coins: Array<{ item: CoinGeckoCoinTrending }> }>(
            urlcat(COINGECKO_URL_BASE, '/search/trending'),
        );

        return response.coins.map(({ item: info }) => {
            return {
                api_symbol: info.symbol,
                id: info.id,
                name: info.name,
                large: info.large,
                market_cap_rank: info.market_cap_rank,
                symbol: info.symbol,
                thumb: info.thumb,
                market: {
                    current_price: info.data.price,
                    price_change_percentage_24h: info.data.price_change_percentage_24h.usd,
                },
            };
        });
    }

    static async getTopMemeCoins() {
        const response = await fetchJSON<CoinGeckoMemeCoinTrending[]>(
            urlcat(COINGECKO_URL_BASE, '/coins/markets', {
                vs_currency: 'usd',
                category: 'meme-token',
                per_page: 50,
            }),
        );

        return response.map((x) => {
            return {
                api_symbol: x.symbol,
                id: x.id,
                name: x.name,
                large: x.image,
                market_cap_rank: x.market_cap_rank,
                symbol: x.symbol,
                thumb: x.image,
                market: {
                    current_price: x.current_price,
                    price_change_percentage_24h: x.price_change_percentage_24h,
                },
            };
        });
    }

    static getChainIdByCoinId(coinId: string) {
        const CoinIdToChainId: Record<string, ChainId> = {
            eth: ChainId.Mainnet,
            pol: ChainId.Polygon,
            bnb: ChainId.BSC,
            fantom: ChainId.Fantom,
            arbitrum: ChainId.Arbitrum,
            scroll: ChainId.Scroll,
            'avalanche-2': ChainId.Avalanche,
        };
        return CoinIdToChainId[coinId];
    }
}
