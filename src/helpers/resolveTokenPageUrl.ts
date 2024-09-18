import urlcat from 'urlcat';

export function resolveTokenPageUrl(symbol: string) {
    return urlcat('/token/:symbol', {
        symbol,
    });
}
