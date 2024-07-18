import { describe, expect, test } from 'vitest';

import { toUnix, toMilliseconds } from '@/helpers/ts.js';

describe('toUnix', () => {
    test('should convert milliseconds timestamp to Unix timestamp', () => {
        const cases = [
            [1627840285000, 1627840285],
            [1000000000000, 1000000000],
            [1633029382000, 1633029382],
        ] as Array<[number, number]>;

        cases.forEach(([input, expectedOutput]) => {
            const result = toUnix(input);
            expect(result).toBe(expectedOutput);
        });
    });

    test('should return Unix timestamp unchanged', () => {
        const cases = [
            [1627840285, 1627840285],
            [1000000000, 1000000000],
            [1633029382, 1633029382],
        ] as Array<[number, number]>;

        cases.forEach(([input, expectedOutput]) => {
            const result = toUnix(input);
            expect(result).toBe(expectedOutput);
        });
    });
});

describe('toMilliseconds', () => {
    test('should convert Unix timestamp to milliseconds timestamp', () => {
        const cases = [
            [1627840285, 1627840285000],
            [1000000000, 1000000000000],
            [1633029382, 1633029382000],
        ] as Array<[number, number]>;

        cases.forEach(([input, expectedOutput]) => {
            const result = toMilliseconds(input);
            expect(result).toBe(expectedOutput);
        });
    });

    test('should return milliseconds timestamp unchanged', () => {
        const cases = [
            [1627840285000, 1627840285000],
            [1000000000000, 1000000000000],
            [1633029382000, 1633029382000],
        ] as Array<[number, number]>;

        cases.forEach(([input, expectedOutput]) => {
            const result = toMilliseconds(input);
            expect(result).toBe(expectedOutput);
        });
    });
});
