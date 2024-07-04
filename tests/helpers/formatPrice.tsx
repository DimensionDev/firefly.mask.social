import { render } from '@testing-library/react';
import { describe, expect, it, test } from 'vitest';

import { formatPrice, renderShrankPrice } from '@/helpers/formatPrice.js';

describe('formatPrice', () => {
    test.each([
        [612345.85, undefined, '612,345.85'],
        ['612345', undefined, '612,345.00'],
        [3234.71, undefined, '3,234.71'],
        [2.356, undefined, '2.36'],
        [2.356, undefined, '2.36'],
        [0.00012345, undefined, '0.0001'],
        [0.00012345, 3, '0.00'],
        [0.00000012345, undefined, '0.0{6}1234'],
        [0.00000012345, 4, '0.0{6}1234'],
        [0.00000012345678, 4, '0.0{6}1234'],
        [0.01234, undefined, '0.01'],
        [0.01255, undefined, '0.01'],
        [0.001255, undefined, '0.0013'],
    ])('format %s with %s digits to %s', (price, digits, expected) => {
        expect(formatPrice(price, digits)).toBe(expected);
    });
});

describe('renderShrankPrice', () => {
    it('should not do anything to unshrank price', () => {
        expect(renderShrankPrice('0.123')).toBe('0.123');
    });

    it('should render shrank price', () => {
        const rendered = renderShrankPrice('0.0{5}123');
        const { asFragment } = render(rendered);

        expect(asFragment()).toMatchInlineSnapshot(`
          <DocumentFragment>
            0.0
            <sub
              class="text-[0.66em]"
            >
              5
            </sub>
            123
          </DocumentFragment>
        `);
    });
});
