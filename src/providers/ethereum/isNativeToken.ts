import { isNativeTokenAddress } from '@masknet/web3-shared-evm';
import { find } from 'lodash-es';
import { isAddress } from 'viem';

import { DEBANK_CHAINS } from '@/constants/chain.js';
import type { Token } from '@/providers/types/Transfer.js';

export function isNativeToken(token: Token) {
    // It is a native token when token.id is not an address
    if (!isAddress(token.id)) {
        const chain = find(DEBANK_CHAINS, (chain) => chain.community_id === token.chainId);
        return !!chain && chain.native_token_id === token.id;
    } else {
        return isNativeTokenAddress(token.id);
    }
}
