import { BigNumber } from 'bignumber.js';

import { removeTrailingZeros } from '@/helpers/removeTrailingZeros.js';

export function formatFloorPrice(price: number) {
    if (price < 0.000001) {
        return '< 0.000001';
    }
    return removeTrailingZeros(BigNumber(price).toFormat(6));
}
