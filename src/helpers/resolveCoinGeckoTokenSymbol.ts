export function resolveCoinGeckoTokenSymbol(symbol: string) {
    switch (symbol) {
        case 'ETH':
        case 'eth':
            return 'ethereum';
        case 'WETH':
            return 'weth';
        case 'MATIC':
            return 'matic-network';
        default:
            return symbol;
    }
}
