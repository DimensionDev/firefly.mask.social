import { describe, expect, test } from 'vitest';

import { formatPrice } from '@/helpers/formatPrice.js';

describe('formatPrice', () => {
    test.each([
        [612345.85, undefined, '612,345.85'],
        ['612345', undefined, '612,345.00'],
        [3234.71, undefined, '3,234.71'],
        [2.356, undefined, '2.36'],
        [2.356, undefined, '2.36'],
        [0.00012345, undefined, '0.0001235'],
        [0.00012345, 3, '0.000123'],
        [0.00000012345, undefined, '0.0{6}1234'],
        [0.00000012345, 4, '0.0{6}1234'],
        [0.00000012345678, 4, '0.0{6}1234'],
        [0.01234, undefined, '0.01234'],
        [0.01255, undefined, '0.01255'],
        [0.001255, undefined, '0.001255'],
        [0.0012553333, undefined, '0.001255'],
        [0.0012555555, undefined, '0.001256'],
    ])('format %s with %s digits to %s', (price, digits, expected) => {
        expect(formatPrice(price, digits)).toBe(expected);
    });
});
