import { describe, expect, it } from 'vitest';

import { formatFloorPrice } from '@/helpers/formatFloorPrice.js';

describe('formatFloorPrice', () => {
    it('should return less than 0.000001', () => {
        expect(formatFloorPrice(0.0000000001020321421421)).toBe('< 0.000001');
    });

    it('should test case 0.1', () => {
        expect(formatFloorPrice(0.1)).toBe('0.1');
    });

    it('should test case 10000', () => {
        expect(formatFloorPrice(10000)).toBe('10,000');
    });

    it('should test case 10000000', () => {
        expect(formatFloorPrice(10000000)).toBe('10,000,000');
    });

    it('should test case `10000000.00000000121321243123`', () => {
        expect(formatFloorPrice(10000000.00000000121321243123)).toBe('10,000,000');
    });

    it('should test case `10000000.000001`', () => {
        expect(formatFloorPrice(10000000.000001)).toBe('10,000,000.000001');
    });
});
