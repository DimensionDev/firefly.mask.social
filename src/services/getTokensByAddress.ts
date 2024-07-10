import urlcat from 'urlcat';

import { SUPPORTED_EVM_CHAIN_IDS } from '@/constants/chain.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { DebankTokensResponse } from '@/providers/types/Firefly.js';
import type { DebankToken } from '@/providers/types/Transfer.js';
import { settings } from '@/settings/index.js';

export async function getTokensByAddress(address: string) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, 'v1/misc/all_token_list', {
        address,
    });
    const result = await fireflySessionHolder.fetch<DebankTokensResponse>(url);
    return result.data?.list ?? [];
}

export async function getTokensByAddressForTips(address: string): Promise<
    Array<
        DebankToken & {
            chainId: number | null;
        }
    >
> {
    const tokens = await getTokensByAddress(address);
    const chains = Object.keys(SUPPORTED_EVM_CHAIN_IDS);

    return tokens.map((token) => {
        const chainName = chains.find((chain) => token.chain === chain.toLowerCase());
        return {
            ...token,
            chainId: chainName ? SUPPORTED_EVM_CHAIN_IDS[chainName as keyof typeof SUPPORTED_EVM_CHAIN_IDS] : null,
        };
    });
}
