import { getAccount } from '@wagmi/core';
import { multiply } from 'lodash-es';
import { type Address, formatUnits } from 'viem';

import { chains, config } from '@/configs/wagmiClient.js';
import { DEBANK_CHAIN_TO_CHAIN_ID_MAP } from '@/constants/chain.js';
import { SimulateStatus, SimulateType } from '@/constants/enum.js';
import { Debank } from '@/providers/debank/index.js';
import type { createSecurityResult } from '@/providers/goplus/createSecurityResult.js';
import { GoPlus } from '@/providers/goplus/index.js';
import { Tenderly } from '@/providers/tenderly/index.js';
import { SecurityMessageLevel } from '@/providers/types/Security.js';
import type { SimulationOptions } from '@/providers/types/Tenderly.js';

type Security<T> = ReturnType<typeof createSecurityResult<T>>;

function formatSecurityMessages<T>(security: Security<T> | null | undefined) {
    if (!security) return [];

    return security.message_list.map((message) => ({
        title: message.title(security),
        level: message.level,
        message: message.message(security),
    }));
}

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

const CHECK_TOKEN = [SimulateType.Swap, SimulateType.Send, SimulateType.Receive];
const CHECK_ADDRESS = [SimulateType.Send, SimulateType.Approve, SimulateType.Unknown];

export async function simulateAndCheckSecurity({ url, chainId, transaction: data }: SimulationOptions) {
    try {
        const account = getAccount(config).address;

        const simulation = data
            ? await Tenderly.simulateTransaction({
                  chain_id: chainId,
                  from_address: account as Address,
                  to_address: data.to as Address,
                  input_data: data.data || '0x',
                  value: data.value?.toString() || '0',
                  url,
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

        const type = simulation?.method as SimulateType;
        const messages = [
            formatSecurityMessages(url ? await GoPlus.checkPhishingSite(url) : null),
            formatSecurityMessages(
                CHECK_TOKEN.includes(type) && data?.to ? await GoPlus.getTokenSecurity(chainId, data.to) : null,
            ),
            formatSecurityMessages(
                CHECK_ADDRESS.includes(type) && data?.to ? await GoPlus.getAddressSecurity(chainId, data.to) : null,
            ),
        ].flat();

        return {
            simulation: simulation?.gasUsed
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
