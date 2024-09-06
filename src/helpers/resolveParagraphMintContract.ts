import { base, optimism, polygon, zora } from 'wagmi/chains';

import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveParagraphMintContract = createLookupTableResolver<number, string>(
    {
        [base.id]: '0x9Bf9D0D88C1A835F1052Ef0FBa325b35bBea127a',
        [optimism.id]: '0x584DfE9780C962e0A48fe09D353CbAa62e67C309',
        [zora.id]: '0x88e6b1341EFA068348b8177F2E59E900CC6D864b',
        [polygon.id]: '0x3285cE203B073bd009200Dfd416a8fD6DF155A57',
    },
    (chainId: number) => {
        throw new UnreachableError('chainId', chainId);
    },
);
