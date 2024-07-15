import type { ChainDescriptor } from '@masknet/web3-shared-base';
import { CHAIN_DESCRIPTORS } from '@masknet/web3-shared-evm';

import { ChainId, NetworkType, SchemaType } from '@/constants/ethereum.js';
import { Resolver } from '@/providers/explorer/Resolver.js';

export const EthereumResolver = new Resolver<ChainId, SchemaType, NetworkType>(
    () => CHAIN_DESCRIPTORS as unknown as Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>,
);
