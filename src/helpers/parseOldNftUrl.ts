import { parseChainId } from '@/helpers/parseChainId.js';

export function parseOldNftUrl(url: URL) {
    if (!/^\/nft\/0x[a-fA-F0-9]{40}/.test(url.pathname)) return null;
    const [, , address, tokenId] = url.pathname.split('/');
    const chainId = parseChainId(url.searchParams.get('chainId') ?? '1');
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
