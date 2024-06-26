export interface Currency {
    id: string;
    chainId?: number;
    name: string;
    symbol?: string;
    description?: string;
}
export type CommunityType =
    | 'discord'
    | 'facebook'
    | 'instagram'
    | 'medium'
    | 'reddit'
    | 'telegram'
    | 'github'
    | 'youtube'
    | 'twitter'
    | 'other';

export type CommunityUrls = Array<{ type: Partial<CommunityType>; link: string }>;

export interface Coin {
    id: string;
    chainId?: number;
    name: string;
    symbol: string;
    type: 'Fungible' | 'NonFungible';
    decimals?: number;
    platform_url?: string;
    tags?: string[];
    tech_docs_urls?: string[];
    message_board_urls?: string[];
    source_code_urls?: string[];
    community_urls?: CommunityUrls;
    home_urls?: string[];
    nftscan_url?: string;
    announcement_urls?: string[];
    blockchain_urls?: string[];
    image_url?: string;
    description?: string;
    market_cap_rank?: number;
    address?: string;
    contract_address?: string;
    facebook_url?: string;
    twitter_url?: string;
    telegram_url?: string;
}

export interface Platform {
    id: string | number;
    name: string;
    slug: string;
    symbol: string;
}
export interface Contract {
    runtime: 'ethereum' | 'solona';
    chainId?: number;
    address: string;
    icon_url?: string;
}

export interface Market {
    current_price: string | undefined;
    circulating_supply?: number;
    fully_diluted_valuation?: number;
    market_cap_fdv_ratio?: number;
    market_cap?: number;
    max_supply?: number;
    total_supply?: number;
    total_volume?: number;
    price_symbol?: string;
    price_token_address?: string;
    price_change_percentage_1h?: number;
    price_change_24h?: number;
    price_change_percentage_1h_in_currency?: number;
    price_change_percentage_1y_in_currency?: number;
    price_change_percentage_7d_in_currency?: number;
    price_change_percentage_14d_in_currency?: number;
    price_change_percentage_24h_in_currency?: number;
    price_change_percentage_30d_in_currency?: number;
    price_change_percentage_60d_in_currency?: number;
    price_change_percentage_200d_in_currency?: number;
    atl_change_percentage?: number;
    /** NFT only */
    floor_price?: string;
    /** NFT only */
    highest_price?: number;
    /** NFT only */
    owners_count?: number;
    /** NFT only */
    royalty?: string;
    /** NFT only */
    total_24h?: number;
    /** NFT only */
    volume_24h?: number;
    /** NFT only */
    average_volume_24h?: number;
    /** NFT only */
    volume_all?: number;
}

export interface Ticker {
    logo_url: string;
    trade_url: string;
    market_name: string;
    /** fungible token only */
    base_name?: string;
    /** fungible token only */
    target_name?: string;
    price?: number;
    volume?: number;
    score?: string;
    updated?: Date;
    /** NFT only */
    volume_24h?: number;
    /** NFT only */
    floor_price?: number;
    price_symbol?: string;
    /** NFT only */
    sales_24?: number;
}

export enum TrendingProvider {
    Coingecko = 'coingecko',
}

export interface Trending {
    provider: TrendingProvider;
    coin: Coin;
    platform?: Platform;
    contracts?: Contract[];
    market?: Market;
    tickers: Ticker[];
    lastUpdated: string;
}
