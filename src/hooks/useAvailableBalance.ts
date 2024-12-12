'use client';
import { isNativeTokenAddress } from '@masknet/web3-shared-evm';
import { useMemo } from 'react';
import { useBalance, useEstimateFeesPerGas } from 'wagmi';

import { config } from '@/configs/wagmiClient.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { multipliedBy, ZERO } from '@/helpers/number.js';
import { type ChainContextOverride, useChainContext } from '@/hooks/useChainContext.js';

export function useAvailableBalance(address: `0x${string}`, gas: number, override?: ChainContextOverride) {
    const isNativeToken = isNativeTokenAddress(address);
    const { chainId, isEIP1559, account } = useChainContext(override);

    const { data: balance } = useBalance({
        token: !isNativeToken ? address : undefined,
        address: account as `0x${string}`,
        config,
        chainId,
    });

    const { data } = useEstimateFeesPerGas({
        chainId,
        config,
        type: isEIP1559 ? 'eip1559' : 'legacy',
    });
    const { gasPrice, maxFeePerGas } = data ?? {};

    return useMemo(() => {
        if (!balance) return;
        const gasFee = multipliedBy((isEIP1559 ? maxFeePerGas?.toString() : gasPrice?.toString()) ?? ZERO, gas);

        if (!isNativeToken)
            return {
                ...balance,
                origin: balance,
                gasFee,
            };

        const result = balance.value - BigInt(gasFee.toNumber());
        return {
            ...balance,
            formatted: result < 0 ? '0' : formatBalance(result.toString(), balance.decimals),
            value: result < 0 ? 0 : result,
            gasFee,
            origin: balance,
        };
    }, [isNativeToken, balance, isEIP1559, gas, gasPrice, maxFeePerGas]);
}
