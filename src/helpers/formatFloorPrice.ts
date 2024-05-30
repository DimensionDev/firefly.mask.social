import { isLessThan } from '@masknet/web3-shared-base';
import { BigNumber } from 'bignumber.js';

import { removeTrailingZeros } from '@/helpers/removeTrailingZeros.js';

export function formatFloorPrice(price: BigNumber.Value) {
    if (isLessThan(price, 0.000001)) {
        return '< 0.000001';
    }
    return removeTrailingZeros(BigNumber(price).toFormat(6));
}
