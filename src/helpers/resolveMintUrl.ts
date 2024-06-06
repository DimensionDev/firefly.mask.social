import { isValidAddress } from '@masknet/web3-shared-evm';
import { first } from 'lodash-es';
import urlcat from 'urlcat';

import { parseCAIP10 } from '@/helpers/parseCAIP10.js';
import { ChainId } from '@/types/frame.js';

export function resolveMintUrl(target: string) {
    const { chainId, address, parameters } = parseCAIP10(target);
    const tokenId = first(parameters);

    switch (chainId) {
        case ChainId.Base:
            if (isValidAddress(address) && tokenId) {
                return urlcat('https://zora.co/collect/base::address/:tokenId', {
                    address,
                    tokenId,
                });
            } else if (isValidAddress(address)) {
                return urlcat('https://zora.co/collect/base::address', {
                    address,
                });
            } else {
                return;
            }
        default:
            return;
    }
}
