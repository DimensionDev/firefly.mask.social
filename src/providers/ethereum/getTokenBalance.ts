import type { ChainId } from '@masknet/web3-shared-evm';
import { getBalance, readContracts } from '@wagmi/core';
import { type Address } from 'viem';

import { queryClient } from '@/configs/queryClient.js';
import { config } from '@/configs/wagmiClient.js';
import { getTokenAbiForWagmi } from '@/helpers/getTokenAbiForWagmi.js';
import { isNativeToken } from '@/providers/ethereum/isNativeToken.js';
import type { Token } from '@/providers/types/Transfer.js';
import { getAllTokenList } from '@/services/getTokensByAddress.js';

export async function getTokenBalance(token: Token<ChainId, Address>, address: Address, chainId: number) {
    if (isNativeToken(token)) {
        const result = await getBalance(config, {
            address,
            chainId,
        });
        return {
            value: result.value,
            decimals: result.decimals,
            symbol: result.symbol,
        };
    }

    const abi = getTokenAbiForWagmi(token.chainId, token.id);
    const results = await readContracts(config, {
        contracts: [
            {
                address: token.id,
                abi,
                functionName: 'balanceOf',
                args: [address],
            },
            {
                address: token.id,
                abi,
                functionName: 'decimals',
            },
            {
                address: token.id,
                abi,
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

export async function getDebankTokenBalance(token: Token<ChainId, Address>, account: Address) {
    const tokens = await queryClient.fetchQuery({
        queryKey: ['debank', 'tokens', account],
        queryFn: () => getAllTokenList(account),
        staleTime: 1000 * 60 * 1,
    });

    const currentToken = tokens.find((t) => t.id === token.id);

    return {
        value: currentToken?.raw_amount ? BigInt(currentToken.raw_amount) : 0n,
        decimals: token.decimals,
        symbol: token.symbol,
    };
}
