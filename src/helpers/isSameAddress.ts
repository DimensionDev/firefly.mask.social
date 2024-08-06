import { safeUnreachable } from '@masknet/kit';
import { PublicKey } from '@solana/web3.js';
import { castArray, compact, uniq } from 'lodash-es';
import { type Address, isAddress, isAddressEqual } from 'viem';

import { NetworkType } from '@/constants/enum.js';

export function isSameAddress(
    address?: string | null,
    otherAddress?: string | null,
    compareType: NetworkType | 'both' = NetworkType.Ethereum,
): boolean {
    if (!address || !otherAddress) return false;
    switch (compareType) {
        case NetworkType.Ethereum:
            return isSameEthereumAddress(address, otherAddress);
        case NetworkType.Solana:
            return isSameSolanaAddress(address, otherAddress);
        case 'both':
            return isSameEthereumAddress(address, otherAddress) || isSameSolanaAddress(address, otherAddress);
        default:
            safeUnreachable(compareType);
            return false;
    }
}

export function isSameEthereumAddress(address: string, otherAddress: string): boolean {
    if (!isAddress(address) || !isAddress(otherAddress)) return false;
    return isAddressEqual(address as Address, otherAddress as Address);
}

export function isSameSolanaAddress(address: string, otherAddress: string): boolean {
    try {
        return new PublicKey(address).equals(new PublicKey(otherAddress));
    } catch {
        return false;
    }
}

export function currySameAddress(addresses: string | string[] = []) {
    addresses = compact(uniq(castArray(addresses))).map((address) => address.toLowerCase());
    return (target?: string | { address: string }) => {
        if (addresses.length === 0 || !target) return false;
        if (typeof target === 'string') {
            return addresses.includes(target.toLowerCase());
        } else if (typeof target === 'object' && typeof target.address === 'string') {
            return addresses.includes(target.address.toLowerCase());
        }
        throw new Error('Unsupported `target` address format');
    };
}
