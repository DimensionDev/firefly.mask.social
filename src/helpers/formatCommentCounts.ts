import { BigNumber } from 'bignumber.js';

/**
 * Returns the specified number as a string with commas added to separate groups of three digits.
 *
 * @param number The number to humanize.
 * @returns The humanized number as a string.
 */
export const humanize = (number: number): string => {
    if (typeof number !== 'number' || isNaN(number)) {
        return '';
    }

    return number.toLocaleString();
};

/**
 * Formats a number by abbreviating it using SI unit prefixes.
 *
 * @param num The number to format.
 * @param digits The number of digits to show after the decimal point. Default is 1.
 * @returns The formatted number as a string with the appropriate prefix.
 */
export const nFormatter = (num: number, digits = 1): string => {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'B' },
        { value: 1e12, symbol: 'T' },
    ];

    // Remove trailing zeros and round to the specified number of digits
    const rx = /\.0+$|(\.\d*[1-9])0+$/;

    // Find the appropriate SI prefix for the number
    const item = [...lookup].reverse().find(function (item) {
        return num >= item.value;
    });

    if (num >= 1e18 && item) {
        const value = new BigNumber(num).dividedBy(item.value);
        let str = value.toFixed(digits);
        if (str.length > 6) {
            str = str.slice(0, 6) + '...';
        }
        return str + item.symbol;
    }

    // Format the number with the appropriate SI prefix and number of digits
    return item
        ? num < 1000
            ? humanize(num)
            : (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
        : '0';
};
