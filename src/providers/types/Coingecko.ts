export interface CoingeckoToken {
    pluginID: 'string';
    id: string;
    symbol: string;
    name: string;
    source: string;
    type: 'FungibleToken';
    logoURL: string;
    rank: 1;
    socialLinks: {
        /** url */
        website: string;
        twitter: string;
        telegram: string;
    };
}
