import { useNetworkDescriptor } from '@masknet/web3-hooks-base';

import { NetworkPluginID } from '@/constants/enum.js';
import { chainInfos } from '@/providers/coingecko/chains.js';
import type { Runtime } from '@/providers/types/Trending.js';

export function useChainInfo(runtime: Runtime | undefined, chainId: number | undefined) {
    const chain = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId);
    // runtime is more accurate than chainId
    return chainInfos.find((x) => x.runtime === runtime) || chain;
}
