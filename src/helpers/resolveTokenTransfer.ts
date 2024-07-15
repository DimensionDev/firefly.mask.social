import { createLookupTableResolver } from '@masknet/shared-base';

import { NetworkType } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { evmNetwork } from '@/providers/evm/Network.js';
import { evmTransfer } from '@/providers/evm/Transfer.js';
import { solanaNetwork } from '@/providers/solana/Network.js';
import { solanaTransfer } from '@/providers/solana/Transfer.js';
import type { Provider as NetworkProvider } from '@/providers/types/Network.js';
import type { Transfer } from '@/providers/types/Transfer.js';

export const resolveTokenTransfer = createLookupTableResolver<NetworkType, Transfer>(
    {
        [NetworkType.Ethereum]: evmTransfer,
        [NetworkType.Solana]: solanaTransfer,
    } as Record<NetworkType, Transfer>,
    (network: NetworkType) => {
        throw new UnreachableError('network', network);
    },
);

export const resolveNetwork = createLookupTableResolver<NetworkType, NetworkProvider>(
    {
        [NetworkType.Ethereum]: evmNetwork,
        [NetworkType.Solana]: solanaNetwork,
    } as Record<NetworkType, NetworkProvider>,
    (network: NetworkType) => {
        throw new UnreachableError('network', network);
    },
);
