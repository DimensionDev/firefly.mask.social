import type { ChainDescriptor } from '@masknet/web3-shared-base';

// eslint-disable-next-line no-restricted-imports
import { ExplorerResolver as Resolver } from '@/maskbook/packages/web3-providers/src/Web3/Base/apis/ExplorerResolver.js';

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
