import type { ChainId } from '@masknet/web3-shared-evm';
import { switchChain } from '@wagmi/core';

import { chains, config } from '@/configs/wagmiClient.js';

export async function switchEthereumChain(chainId: ChainId) {
    const chain = chains.find((chain) => chain.id === chainId);
    await switchChain(config, {
        chainId,
        addEthereumChainParameter: chain
            ? {
                  chainName: chain.name,
                  nativeCurrency: chain.nativeCurrency,
                  rpcUrls: chain.rpcUrls.default.http,
                  blockExplorerUrls: [chain.blockExplorers.default.url],
              }
            : undefined,
    });
}
