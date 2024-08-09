/* cspell:disable */

import { first } from 'lodash-es';
import urlcat from 'urlcat';
import { isAddress } from 'viem';

import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { isSameOriginUrl } from '@/helpers/isSameOriginUrl.js';
import { parseCAIP10 } from '@/helpers/parseCAIP10.js';
import { ChainId, type Frame, type FrameButton } from '@/types/frame.js';

const resolveZoraChainName = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.Ethereum]: 'ethereum',
        [ChainId.Polygon]: 'polygon',
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

export function getFrameMintUrl({ url }: Frame, button: FrameButton) {
    const targetUrl = button.target;
    if (!targetUrl) return url;

    const { chainId, address, parameters } = parseCAIP10(targetUrl);
    if (!address) return url;

    // zora mint
    if (isSameOriginUrl(url, 'https://zora.co/')) {
        const tokenId = first(parameters);
        const chainName = resolveZoraChainName(chainId);

        if (isAddress(address) && tokenId) {
            return urlcat(`https://zora.co/collect/${chainName}::address/:tokenId`, {
                address,
                tokenId,
            });
        }
        if (isAddress(address)) {
            return urlcat(`https://zora.co/collect/${chainName}::address`, {
                address,
            });
        }
    }

    return url;
}
