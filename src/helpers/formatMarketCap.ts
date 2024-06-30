import { BigNumber } from 'bignumber.js';

function abbreviationForZero(str: string, zeroCount: number) {
    if (zeroCount <= 1) return str;
    return str.replace(`${new Array(zeroCount).fill('0').join('')}`, `0(${zeroCount})`);
}

function removeTrailingZeros(str: string) {
    const result = str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    return result === '0' ? '0' : result;
}

export function formatMarketCap(amount: BigNumber.Value, digits = 2) {
    let bigNumber = BigNumber(amount);
    const isNegative = bigNumber.isNegative();
    const prefix = isNegative ? '-' : '';
    bigNumber = bigNumber.abs();
    if (bigNumber.isGreaterThanOrEqualTo(1000)) {
        const suffixes = ['', 'K', 'M', 'B', 'T', 'P'];
        let suffixIndex = 0;
        while (bigNumber.isGreaterThanOrEqualTo(1000) && suffixIndex < suffixes.length - 1) {
            bigNumber = bigNumber.dividedBy(1000);
            suffixIndex += 1;
        }
        return prefix + parseFloat(bigNumber.toFixed(digits)) + (suffixes[suffixIndex] ?? '');
    }
    if (bigNumber.isLessThan(1)) {
        const zeroCount = bigNumber.toFormat().substring(2).match(/^0+/)?.[0].length ?? 0;
        const format = bigNumber.toFormat(zeroCount + digits, 1);
        if (format.length >= 10) {
            return prefix + abbreviationForZero(removeTrailingZeros(format), zeroCount);
        }
        return prefix + removeTrailingZeros(format);
    }
    return prefix + removeTrailingZeros(bigNumber.toFormat(digits));
}
