import { BigNumber } from 'bignumber.js';

import { removeTrailingZeros } from '@/helpers/removeTrailingZeros.js';

export function formatFloorPrice(price: BigNumber.Value) {
    if (BigNumber(price).isLessThan(0.000001)) {
        return '< 0.000001';
    }
    return removeTrailingZeros(BigNumber(price).toFormat(6));
}
