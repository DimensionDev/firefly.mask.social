import { castArray, compact, uniq } from 'lodash-es';
import { type Address, isAddress, isAddressEqual } from 'viem';

export function isSameAddress(address?: string | null | undefined, otherAddress?: string | null | undefined): boolean {
    if (!address || !otherAddress) return false;
    if (!isAddress(address) || !isAddress(otherAddress)) return false;
    return isAddressEqual(address as Address, otherAddress as Address);
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
