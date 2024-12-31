import type { ChainDescriptor } from '@masknet/web3-shared-base';

import { ExplorerResolver as Resolver } from '@/mask/index.js';

class ExplorerResolver<ChainId, SchemaType, NetworkType> extends Resolver<ChainId, SchemaType, NetworkType> {
    constructor(
        descriptors: () => ReadonlyArray<ChainDescriptor<ChainId, SchemaType, NetworkType>>,
        initial?: ConstructorParameters<typeof Resolver>[1],
    ) {
        super(descriptors, initial);
    }

    protected override getExplorerURL() {
        return { url: 'https://blockscan.com' };
    }
}

export const BlockScanExplorerResolver = new ExplorerResolver(() => [], {
    fungibleTokenPathname: '/token/:address',
});
