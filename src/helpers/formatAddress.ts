import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { formatSolanaAddress } from '@/helpers/formatSolanaAddress.js';
import { isValidSolanaAddress } from '@/helpers/isValidSolanaAddress.js';

export function formatAddress(address: string, size?: number) {
    if (isValidSolanaAddress(address)) return formatSolanaAddress(address, size);
    return formatEthereumAddress(address, size);
}
