import { describe, expect, it } from 'vitest';

import { getTimeLeft } from '@/helpers/getTimeLeft.js';

function forwardMinutes(minutes: number) {
    return new Date(new Date().getTime() + minutes * 60000).toISOString();
}

describe('getTimeLeft', () => {
    it('No time left', () => {
        expect(getTimeLeft(forwardMinutes(-1))).toStrictEqual({ days: -1, hours: -1, minutes: -1, seconds: -60 });
    });

    it('1 day left', () => {
        expect(getTimeLeft(forwardMinutes(60 * 24))).toStrictEqual({
            days: 1,
            hours: 24,
            minutes: 1440,
            seconds: 86400,
        });
    });

    it('2 days left', () => {
        expect(getTimeLeft(forwardMinutes(60 * 48))).toStrictEqual({
            days: 2,
            hours: 48,
            minutes: 2880,
            seconds: 172800,
        });
    });

    it('1 hour left', () => {
        expect(getTimeLeft(forwardMinutes(60 * 1))).toStrictEqual({ days: 0, hours: 1, minutes: 60, seconds: 3600 });
    });

    it('2 hours left', () => {
        expect(getTimeLeft(forwardMinutes(60 * 2))).toStrictEqual({ days: 0, hours: 2, minutes: 120, seconds: 7200 });
    });

    it('1 minute left', () => {
        expect(getTimeLeft(forwardMinutes(1))).toStrictEqual({ days: 0, hours: 0, minutes: 1, seconds: 60 });
    });

    it('2 minutes left', () => {
        expect(getTimeLeft(forwardMinutes(2))).toStrictEqual({ days: 0, hours: 0, minutes: 2, seconds: 120 });
    });
});
