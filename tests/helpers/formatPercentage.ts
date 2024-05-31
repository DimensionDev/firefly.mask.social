import { describe, expect, it } from 'vitest';

import { formatPercentage } from '@/helpers/formatPercentage.js';

describe('formatPercentage', () => {
    it('should return `0.01%`', () => {
        expect(formatPercentage(0.0000000001020321421421)).toBe('< 0.01%');
    });

    it('should return `50%`', () => {
        expect(formatPercentage(0.5)).toBe('50%');
    });

    it('should return `100%`', () => {
        expect(formatPercentage(1)).toBe('100%');
    });

    it('should return `150%`', () => {
        expect(formatPercentage(1.5)).toBe('150%');
    });
});
