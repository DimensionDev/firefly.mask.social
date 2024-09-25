import { memoize } from 'lodash-es';
import { checksumAddress, isAddress } from 'viem';

import { isValidSolanaAddress } from '@/helpers/isValidSolanaAddress.js';

type Offset = 0 | 2;

type Formatter = (address: string, size?: number, offset?: Offset) => string;

const resolver = (address: string, size = 0) => `${address}.${size}`;

export function formatAddress(address: string, size?: number, offset?: Offset) {
    if (isValidSolanaAddress(address)) return formatSolanaAddress(address, size, offset);
    return formatEthereumAddress(address, size, offset);
}

export const formatSolanaAddress: Formatter = memoize(function format(address, size = 0, offset = 0) {
    if (!isValidSolanaAddress(address, false)) return address;
    if (size === 0 || size >= 22) return address;
    return `${address.slice(0, Math.max(0, offset + size))}...${address.slice(-size)}`;
}, resolver);

export const formatEthereumAddress: Formatter = memoize(function formatEthereumAddress(
    address: string,
    size = 0,
    offset = 2,
) {
    if (!isAddress(address)) return address;
    const address_ = checksumAddress(address);
    if (size === 0 || size >= 20) return address_;
    return `${address_.slice(0, Math.max(0, offset + size))}...${address_.slice(-size)}`;
}, resolver);
