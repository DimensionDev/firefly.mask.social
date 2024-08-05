import { useNetworkDescriptor } from '@masknet/web3-hooks-base';

import { NetworkPluginID } from '@/constants/enum.js';
import { chainInfos } from '@/providers/coingecko/chain-infos.js';
import type { Runtime } from '@/providers/types/Trending.js';

export function useChainInfo(runtime: Runtime | undefined, chainId: number | undefined) {
    const chain = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId);
    if (runtime === 'ethereum' && chain) return chain;
    return chainInfos.find((x) => x.runtime === runtime);
}
