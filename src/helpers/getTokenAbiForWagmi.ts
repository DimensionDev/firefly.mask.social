import { ChainId } from '@masknet/web3-shared-evm';
import { type Address, erc20Abi } from 'viem';

import { USDT } from '@/abis/USDT.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';

const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';

export function getTokenAbiForWagmi(chainId: number, tokenAddress: Address) {
    // https://github.com/wevm/wagmi/issues/2749
    if (chainId === ChainId.Mainnet && isSameAddress(tokenAddress, usdtAddress)) {
        return USDT;
    }

    return erc20Abi;
}
