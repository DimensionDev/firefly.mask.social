import urlcat from 'urlcat';

import { queryClient } from '@/configs/queryClient.js';
import { DEBANK_CHAIN_TO_CHAIN_ID_MAP, DEBANK_CHAINS } from '@/constants/chain.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Token as DebankToken } from '@/providers/types/Debank.js';
import type { DebankTokensResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

function resolveDeBankChain(deBankChain: string) {
    const chain = DEBANK_CHAINS.find((chain) => chain.id === deBankChain);
    if (chain) return { id: chain.community_id, logoUrl: chain.logo_url };

    if (deBankChain in DEBANK_CHAIN_TO_CHAIN_ID_MAP) {
        return { id: DEBANK_CHAIN_TO_CHAIN_ID_MAP[deBankChain] };
    }
    return;
}

export async function getAllTokenList(address: string) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, 'v1/misc/all_token_list', {
        address,
    });
    const result = await fireflySessionHolder.fetch<DebankTokensResponse>(url);
    return result.data?.list ?? [];
}

export async function getTokensByAddress(address: string): Promise<
    Array<
        DebankToken & {
            chainId?: number;
            chainLogoUrl?: string;
        }
    >
> {
    const tokens = await queryClient.fetchQuery({
        queryKey: ['debank', 'tokens', address],
        queryFn: () => getAllTokenList(address),
        staleTime: 1000 * 60 * 1,
    });

    return tokens.map((token) => {
        const chain = resolveDeBankChain(token.chain);
        return {
            ...token,
            chainId: chain?.id,
            chainLogoUrl: chain?.logoUrl,
        };
    });
}
