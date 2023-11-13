import { memoize } from 'lodash-es';
import { Address, checksumAddress, isAddress } from 'viem';

export const isValidAddress: (address?: string) => address is string = memoize(function isValidAddress(
    address?: string,
): address is string {
    if (!address) return false;
    return isAddress(address);
});

export const formatEthereumAddress: (address: string, size?: number) => string = memoize(
    function formatEthereumAddress(address: string, size = 0) {
        if (!isValidAddress(address)) return address;
        const address_ = checksumAddress(address as Address);
        if (size === 0 || size >= 20) return address_;
        return `${address_.slice(0, Math.max(0, 2 + size))}...${address_.slice(-size)}`;
    },
    (addr, size) => `${addr}.${size}`,
);
