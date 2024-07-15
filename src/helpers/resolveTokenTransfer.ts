import { createLookupTableResolver } from '@masknet/shared-base';

import { NetworkType } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { EthereumNetwork } from '@/providers/ethereum/Network.js';
import { EthereumTransfer } from '@/providers/ethereum/Transfer.js';
import { SolanaNetwork } from '@/providers/solana/Network.js';
import { SolanaTransfer } from '@/providers/solana/Transfer.js';
import type { NetworkProvider } from '@/providers/types/Network.js';
import type { TransferProvider } from '@/providers/types/Transfer.js';

export const resolveTokenTransfer = createLookupTableResolver<NetworkType, TransferProvider>(
    {
        [NetworkType.Ethereum]: EthereumTransfer,
        [NetworkType.Solana]: SolanaTransfer,
    } as Record<NetworkType, TransferProvider>,
    (network: NetworkType) => {
        throw new UnreachableError('network', network);
    },
);

export const resolveNetwork = createLookupTableResolver<NetworkType, NetworkProvider>(
    {
        [NetworkType.Ethereum]: EthereumNetwork,
        [NetworkType.Solana]: SolanaNetwork,
    } as Record<NetworkType, NetworkProvider>,
    (network: NetworkType) => {
        throw new UnreachableError('network', network);
    },
);
