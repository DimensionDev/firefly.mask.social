/* cspell:disable */

import { createLookupTableResolver } from '@masknet/shared-base';
import { isValidAddress } from '@masknet/web3-shared-evm';
import { first } from 'lodash-es';
import urlcat from 'urlcat';

import { UnreachableError } from '@/constants/error.js';
import { parseCAIP10 } from '@/helpers/parseCAIP10.js';
import { ChainId } from '@/types/frame.js';

const resolveZoraChainName = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.Ethereum]: 'ethereum',
        [ChainId.Arbitrum]: 'arbitrum',
        [ChainId.Base]: 'base',
        [ChainId.Base_Sepolia]: 'base_sepolia',
        [ChainId.Degen]: 'degen',
        [ChainId.Gnosis]: 'gnosis',
        [ChainId.Optimism]: 'optimism',
        [ChainId.Zora]: 'zora',
    },
    (chainId) => {
        throw new UnreachableError('chainId', chainId);
    },
);

export function resolveMintUrl(target: string) {
    const { chainId, address, parameters } = parseCAIP10(target);
    const tokenId = first(parameters);

    const chainName = resolveZoraChainName(chainId);

    if (isValidAddress(address) && tokenId) {
        return urlcat(`https://zora.co/collect/${chainName}::address/:tokenId`, {
            address,
            tokenId,
        });
    } else if (isValidAddress(address)) {
        return urlcat(`https://zora.co/collect/${chainName}::address`, {
            address,
        });
    } else {
        return;
    }
}
