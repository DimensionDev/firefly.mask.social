import { isSameAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';
import { safeUnreachable } from '@masknet/kit';

export function isSameConnectionAddress(platform: 'eth' | 'solana', address: string, otherAddress: string) {
    switch (platform) {
        case 'eth':
            return isSameAddress(address, otherAddress);
        case 'solana':
            return isSameSolanaAddress(address, otherAddress);
        default:
            safeUnreachable(platform);
            return false;
    }
}
