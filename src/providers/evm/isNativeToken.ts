import { isNativeTokenAddress } from '@masknet/web3-shared-evm';
import { isAddress } from 'viem';

import type { Token } from '@/providers/types/Transfer.js';

export function isNativeToken(token: Token) {
    // It is a native token when token.id is not an address
    if (!isAddress(token.id)) {
        return true;
    } else {
        return isNativeTokenAddress(token.id);
    }
}
