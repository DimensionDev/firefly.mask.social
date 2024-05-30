import { isLessThan } from '@masknet/web3-shared-base';

import { removeTrailingZeros } from '@/helpers/removeTrailingZeros.js';

/**
 * @param value 0-1
 */
export function formatPercentage(value: number) {
    if (isLessThan(value, '0.0001')) {
        return '< 0.01%';
    }
    return `${removeTrailingZeros((value * 100).toFixed(2))}%`;
}
