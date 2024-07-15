import type { NonFungibleAsset as NonFungibleAssetType } from '@masknet/web3-shared-base';

import { ChainId, MethodType, SchemaType } from '@/constants/ethereum.js';

export interface RequestArguments {
    method: MethodType;
    params: any[];
}

export type NonFungibleAsset = NonFungibleAssetType<ChainId, SchemaType>;
