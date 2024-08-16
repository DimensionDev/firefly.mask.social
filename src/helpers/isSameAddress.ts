import { PublicKey } from '@solana/web3.js';
import { type Address, isAddress, isAddressEqual } from 'viem';

export function isSameAddress(address?: string, otherAddress?: string): boolean {
    if (!address || !otherAddress) return false;
    if (!isAddress(address) || !isAddress(otherAddress)) return false;
    return isAddressEqual(address as Address, otherAddress as Address);
}

export function isSameSolanaAddress(address?: string, otherAddress?: string): boolean {
    try {
        if (!address || !otherAddress) return false;
        return new PublicKey(address).equals(new PublicKey(otherAddress));
    } catch {
        return false;
    }
}
