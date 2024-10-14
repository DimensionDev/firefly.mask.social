import type { ChainId } from '@masknet/web3-shared-evm';

export function parseOldNftUrl(url: URL) {
    if (!/^\/nft\/0x[a-fA-F0-9]{40}/.test(url.pathname)) return null;
    const [, , address, tokenId] = url.pathname.split('/');
    const chainId = parseInt(url.searchParams.get('chainId') ?? '1', 10) as ChainId;
    if (!chainId) return null;
    if (tokenId) {
        return {
            address,
            tokenId,
            chainId,
        };
    }
    return {
        address,
        chainId,
    };
}
