import { ARWEAVE_GATEWAY, IPFS_GATEWAY } from '@/constants/index.js';

export function sanitizeDStorageUrl(hash?: string) {
    if (!hash) return '';

    return hash
        .replace(/^Qm[1-9A-Za-z]{44}/gm, `${IPFS_GATEWAY}${hash}`)
        .replace('https://ipfs.io/ipfs/', IPFS_GATEWAY)
        .replace('ipfs://ipfs/', IPFS_GATEWAY)
        .replace('ipfs://', IPFS_GATEWAY)
        .replace('ar://', ARWEAVE_GATEWAY);
}
