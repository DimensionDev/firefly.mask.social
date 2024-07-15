import { type Config, getBalance, readContracts } from '@wagmi/core';
import { type Address, erc20Abi } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { isNativeToken } from '@/providers/evm/isNativeToken.js';
import type { Token } from '@/providers/types/Transfer.js';

const coreConfig = config as unknown as Config;

export async function getTokenBalance(token: Token, address: Address, chainId: number) {
    if (isNativeToken(token)) {
        const result = await getBalance(coreConfig, {
            address,
            chainId,
        });
        return {
            value: result.value,
            decimals: result.decimals,
            symbol: result.symbol,
        };
    }
    const results = await readContracts(coreConfig, {
        contracts: [
            {
                address: token.id,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address],
            },
            {
                address: token.id,
                abi: erc20Abi,
                functionName: 'decimals',
            },
            {
                address: token.id,
                abi: erc20Abi,
                functionName: 'symbol',
            },
        ],
    });

    const resultWithError = results.find((d) => d.status !== 'success');

    if (resultWithError) {
        throw resultWithError.error;
    }

    return {
        value: results[0].result ?? 0n,
        decimals: results[1].result,
        symbol: results[2].result,
    };
}
