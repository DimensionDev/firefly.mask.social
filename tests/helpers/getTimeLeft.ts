import { describe, expect, it } from 'vitest';

import { getTimeLeft } from '@/helpers/getTimeLeft.js';

function getDurationTextAt(intervalMinutes: number) {
    const now = new Date().getTime();
    const startDate = new Date(now).toISOString();
    const endDate = new Date(now + intervalMinutes * 60000).toISOString();
    const { days, hours, minutes, seconds } = getTimeLeft(endDate, startDate);

    if (days >= 1) return `${days} days left`;
    if (hours >= 1) return `${hours} hours left`;
    if (minutes >= 1) return `${minutes} minutes left`;
    if (seconds >= 1) return `${seconds} seconds left`;
    return 'Final results';
}

describe('getTimeLeft', () => {
    it('No time left', () => {
        expect(getDurationTextAt(-1)).toBe('Final results');
    });

    it('1 day left', () => {
        expect(getDurationTextAt(60 * 24)).toBe('1 days left');
    });

    it('2 days left', () => {
        expect(getDurationTextAt(60 * 48)).toBe('2 days left');
    });

    it('1 hour left', () => {
        expect(getDurationTextAt(60 * 1)).toBe('1 hours left');
    });

    it('2 hours left', () => {
        expect(getDurationTextAt(60 * 2)).toBe('2 hours left');
    });

    it('1 minute left', () => {
        expect(getDurationTextAt(1)).toBe('1 minutes left');
    });

    it('2 minutes left', () => {
        expect(getDurationTextAt(2)).toBe('2 minutes left');
    });
});
