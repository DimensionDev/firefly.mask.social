import { zeroAddress } from 'viem';

import { useOkxSupportedChains } from '@/components/TokenProfile/useOkxSupportedChains.js';
import { useCoinTrending } from '@/hooks/useCoinTrending.js';
import { CoinGecko } from '@/providers/coingecko/index.js';
import type { CoinGeckoToken } from '@/providers/types/CoinGecko.js';

export function useTradeInfo(token: CoinGeckoToken) {
    const { data: trending } = useCoinTrending(token.id);
    const { data: supportedChains = [] } = useOkxSupportedChains();
    const { contracts = [] } = trending ?? {};
    const chainIds = supportedChains.map((x) => x.chainId);
    const firstAvailable = contracts.find((x) => x.chainId && chainIds.includes(x.chainId));
    const chainId = CoinGecko.getChainIdByCoinId(token.id) || firstAvailable?.chainId;

    if (!chainId || !chainIds.includes(chainId))
        return {
            tradable: false,
        };

    return {
        tradable: true,
        chainId,
        address: CoinGecko.getChainIdByCoinId(token.id) ? zeroAddress : firstAvailable?.address,
    };
}
