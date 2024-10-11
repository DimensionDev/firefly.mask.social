import { safeUnreachable } from '@masknet/kit';

import { NetworkType } from '@/constants/enum.js';

export function resolveNetworkIcon(networkType: NetworkType, isDarkMode: boolean) {
    switch (networkType) {
        case NetworkType.Solana:
            return new URL(`../assets/chains/solana.png`, import.meta.url).href;
        case NetworkType.Ethereum:
            return isDarkMode
                ? new URL('../assets/chains/ethereum.dark.png', import.meta.url).href
                : new URL('../assets/chains/ethereum.light.png', import.meta.url).href;
        default:
            safeUnreachable(networkType);
            return null;
    }
}
