import { safeUnreachable } from '@masknet/kit';

import { isSameEthereumAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';

export function isSameConnectionAddress(platform: 'eth' | 'solana', address: string, otherAddress: string) {
    switch (platform) {
        case 'eth':
            return isSameEthereumAddress(address, otherAddress);
        case 'solana':
            return isSameSolanaAddress(address, otherAddress);
        default:
            safeUnreachable(platform);
            return false;
    }
}
