import { ChainId } from '@masknet/web3-shared-evm';
import urlcat from 'urlcat';

import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { UserTokensResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';
import type { UserToken } from '@/types/token.js';

export async function getTokensByAddress(address: string) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, 'v1/misc/all_token_list', {
        address,
    });
    const result = await fireflySessionHolder.fetch<UserTokensResponse>(url);
    return result.data?.list ?? [];
}

export async function getTokensByAddressForTips(address: string): Promise<Array<UserToken & {
    chainId: ChainId | null;
}>> {
    const tokens = await getTokensByAddress(address);
    const chains = Object.keys(ChainId);

    return tokens.map((token) => {
        const chainName = chains.find((chain) => token.chain === chain.toLowerCase());
        return {
            ...token,
            chainId: chainName ? ChainId[chainName as keyof typeof ChainId] : null,
        };
    });
}
