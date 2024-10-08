import { isAddress as isValidEthereumAddress } from 'viem';

import { NetworkType } from '@/constants/enum.js';
import { isValidSolanaAddress } from '@/helpers/isValidSolanaAddress.js';

export function getAddressType(address: string) {
    if (isValidEthereumAddress(address)) return NetworkType.Ethereum;
    if (isValidSolanaAddress(address)) return NetworkType.Solana;
    return null;
}
