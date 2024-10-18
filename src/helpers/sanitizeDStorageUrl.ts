import { ARWEAVE_GATEWAY, COVER, HEY_IMAGEKIT_URL, HEY_IPFS_GW_URL, IPFS_GATEWAY } from '@/constants/index.js';

export function sanitizeDStorageUrl(hash?: string, gateway?: string) {
    if (!hash) return '';

    if (hash.includes(HEY_IPFS_GW_URL)) {
        return `${HEY_IMAGEKIT_URL}/fallback/${COVER},q-80/${hash}`;
    }
    return hash
        .replace(/^Qm[1-9A-Za-z]{44}/gm, `${gateway ?? IPFS_GATEWAY}${hash}`)
        .replace('ipfs://ipfs/', gateway ?? IPFS_GATEWAY)
        .replace('ipfs://', gateway ?? IPFS_GATEWAY)
        .replace('ar://', ARWEAVE_GATEWAY);
}
