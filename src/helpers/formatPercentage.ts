import { removeTrailingZeros } from '@/helpers/removeTrailingZeros.js';
// eslint-disable-next-line no-restricted-imports
import { isLessThan } from '@/maskbook/packages/web3-shared/base/src/helpers/number.js';

/**
 * @param value 0-1
 */
export function formatPercentage(value: number) {
    if (isLessThan(value, '0.0001')) {
        return '< 0.01%';
    }
    return `${removeTrailingZeros((value * 100).toFixed(2))}%`;
}
