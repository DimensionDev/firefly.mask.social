import { memoize } from 'lodash-es';
import { checksumAddress, isAddress } from 'viem';

export const formatEthereumAddress: (address: string, size?: number) => string = memoize(
    function formatEthereumAddress(address: string, size = 0) {
        if (!isAddress(address)) return address;
        const address_ = checksumAddress(address);
        if (size === 0 || size >= 20) return address_;
        return `${address_.slice(0, Math.max(0, 2 + size))}...${address_.slice(-size)}`;
    },
    (addr, size) => `${addr}.${size}`,
);
