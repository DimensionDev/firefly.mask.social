import { describe, expect, it } from 'vitest';

import { getTimeLeft } from '@/helpers/getTimeLeft.js';

function forwardMinutes(minutes: number) {
    return new Date(new Date().getTime() + minutes * 60000).toISOString();
}

describe('getTimeLeft', () => {
    it('No time left', () => {
        expect(getTimeLeft(forwardMinutes(-1))).toContain({ days: -1 });
    });

    it('1 day left', () => {
        expect(getTimeLeft(forwardMinutes(60 * 24))).toContain({ days: 1 });
    });

    it('2 days left', () => {
        expect(getTimeLeft(forwardMinutes(60 * 48))).toContain({ days: 2 });
    });

    it('1 hour left', () => {
        expect(getTimeLeft(forwardMinutes(60 * 1))).toContain({ hours: 1 });
    });

    it('2 hours left', () => {
        expect(getTimeLeft(forwardMinutes(60 * 2))).toContain({ hours: 2 });
    });

    it('1 minute left', () => {
        expect(getTimeLeft(forwardMinutes(1))).toContain({ minutes: 1 });
    });

    it('2 minutes left', () => {
        expect(getTimeLeft(forwardMinutes(2))).toContain({ minutes: 2 });
    });
});
