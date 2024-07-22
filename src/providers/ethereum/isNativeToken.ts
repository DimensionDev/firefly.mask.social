import { isNativeTokenAddress } from '@masknet/web3-shared-evm';
import { find } from 'lodash-es';
import { isAddress } from 'viem';

import { chains } from '@/configs/wagmiClient.js';
import type { Token } from '@/providers/types/Transfer.js';

export function isNativeToken(token: Token) {
    // It is a native token when token.id is not an address
    if (!isAddress(token.id)) {
        const chain = find(chains, (chain) => chain.id === token.chainId);
        return !!chain && chain.nativeCurrency.symbol === token.symbol;
    } else {
        return isNativeTokenAddress(token.id);
    }
}
