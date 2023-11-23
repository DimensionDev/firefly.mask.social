import urlcat from 'urlcat';

/**
 * Returns the cdn.stamp.fyi URL for the specified Ethereum address.
 *
 * @param address The Ethereum address to get the URL for.
 * @returns The cdn.stamp.fyi URL.
 */
export function getStampFyiURL(address: string): string {
    return urlcat('https://cdn.stamp.fyi/avatar/eth::address', {
        address: address.toLowerCase(),
        s: 300,
    });
}
