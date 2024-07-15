import { chains } from '@/configs/wagmiClient.js';

export function isSupportedChainId(chainId: number) {
    return chains.some((x) => x.id === chainId);
}
