import { createLookupTableResolver } from '@masknet/shared-base';

import { NetworkType } from '@/constants/enum.js';
import { evmTransfer } from '@/providers/evm/index.js';
import { solanaTransfer } from '@/providers/solana/index.js';
import type { Transfer } from '@/providers/types/Transfer.js';

export const resolveTokenTransfer = createLookupTableResolver<NetworkType, Transfer>(
    {
        [NetworkType.Ethereum]: evmTransfer,
        [NetworkType.Solana]: solanaTransfer,
    } as Record<NetworkType, Transfer>,
    (network: NetworkType) => {
        throw new Error(`Unsupported network: ${network}`);
    },
);
