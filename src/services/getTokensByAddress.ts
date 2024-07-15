import urlcat from 'urlcat';

import { DEBANK_CHAINS } from '@/constants/chain.js';
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

    return tokens.map((token) => {
        const chain = DEBANK_CHAINS.find((chain) => chain.id === token.chain);
        return {
            ...token,
            chainId: chain ? chain.community_id : null,
        };
    });
}
