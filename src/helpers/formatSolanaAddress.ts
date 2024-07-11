import { isValidSolanaAddress } from '@/helpers/isValidSolanaAddress.js';

export function formatSolanaAddress(address: string, size = 0) {
    if (!isValidSolanaAddress(address, false)) return address;
    if (size === 0 || size >= 22) return address;
    return `${address.slice(0, Math.max(0, size))}...${address.slice(-size)}`;
}
