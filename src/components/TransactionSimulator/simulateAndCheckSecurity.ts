import { getAccount } from '@wagmi/core';
import { multiply } from 'lodash-es';
import { type Address, formatUnits } from 'viem';

import { chains, config } from '@/configs/wagmiClient.js';
import { DEBANK_CHAIN_TO_CHAIN_ID_MAP } from '@/constants/chain.js';
import { SimulateStatus } from '@/constants/enum.js';
import { Debank } from '@/providers/debank/index.js';
import { GoPlus } from '@/providers/goplus/index.js';
import { Tenderly } from '@/providers/tenderly/index.js';
import { SecurityMessageLevel } from '@/providers/types/Security.js';
import type { SimulationOptions } from '@/providers/types/Tenderly.js';

async function getNetworkFee(chainId: number, gasUsed: number) {
    try {
        const nativeCurrency = chains.find((chain) => chain.id === chainId)?.nativeCurrency;
        const debankChain = Object.keys(DEBANK_CHAIN_TO_CHAIN_ID_MAP).find((chain) => {
            return DEBANK_CHAIN_TO_CHAIN_ID_MAP[chain] === chainId;
        });
        if (!debankChain || !nativeCurrency) return;

        const prices = await Debank.getGasPrice(debankChain);
        const normalPrice = prices.find((price) => price.level === 'normal')?.price || prices[0].price;
        if (!normalPrice) return;

        return {
            value: formatUnits(BigInt(multiply(normalPrice, gasUsed)), nativeCurrency.decimals),
            symbol: nativeCurrency.symbol,
        };
    } catch {
        return;
    }
}

export async function simulateAndCheckSecurity({ url, chainId, transaction: data }: SimulationOptions) {
    try {
        const account = getAccount(config).address;
        const txData = data
            ? {
                  chain_id: chainId,
                  to_address: data.to as Address,
                  input_data: data.data || '0x',
                  value: data.value?.toString() || '0',
                  url,
              }
            : null;

        const simulation = txData
            ? await Tenderly.simulateTransaction({
                  ...txData,
                  from_address: account as Address,
              })
            : undefined;
        if (simulation?.status === false) {
            return {
                simulation,
                status: SimulateStatus.Error,
                messages: [
                    {
                        title: simulation.errorMessage || 'Unknown error',
                        level: SecurityMessageLevel.High,
                        message: simulation.errorMessageDetails || 'We are unable to simulate this transaction',
                    },
                ],
            };
        }

        const messages =
            simulation?.status || url
                ? await GoPlus.checkTransaction({
                      ...txData,
                      chain_id: chainId.toString(),
                      url,
                  })
                : [];

        return {
            simulation:
                simulation?.status && simulation.gasUsed
                    ? {
                          ...simulation,
                          fee: await getNetworkFee(chainId, simulation.gasUsed),
                      }
                    : simulation,
            status: messages.length ? SimulateStatus.Unsafe : SimulateStatus.Success,
            messages,
        };
    } catch {
        return {
            simulation: undefined,
            status: SimulateStatus.Unverified,
            messages: [],
        };
    }
}
