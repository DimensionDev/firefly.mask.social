import { describe, expect, test } from 'vitest';

import { HASHTAG_REGEX, MENTION_REGEX } from '@/constants/regex.js';

describe('MENTION_REGEXP', () => {
    test('should match a mention', () => {
        const cases = [
            ['@handle', true],
            ['handle', false],
            ['handle@', false],
            ['handle @', false],
            ['@handle_name', true],
            ['handle @name', true],
            ['@handle.lens', true],
            ['@lens/handle', true],
            ['@club/handle', true],
            [['This is message', 'with a @mention'].join('\n'), true],
        ] as Array<[string, boolean]>;

        cases.forEach(([input, expectedOutput]) => {
            // reset the regex
            MENTION_REGEX.lastIndex = 0;

            const result = MENTION_REGEX.test(input);
            expect(result).toBe(expectedOutput);
        });
    });
});

describe('HASHTAG_REGEXP', () => {
    test('should match a hashtag', () => {
        const cases = [
            ['#hello', true],
            ['hello', false],
            ['hello#', false],
            ['hello #', false],
            ['#hello_world', true],
            ['hello #world', true],
            [['This is message', 'with a #hashtag'].join('\n'), true],
        ] as Array<[string, boolean]>;

        cases.forEach(([input, expectedOutput]) => {
            // reset the regex
            HASHTAG_REGEX.lastIndex = 0;

            const result = HASHTAG_REGEX.test(input);
            expect(result).toBe(expectedOutput);
        });
    });
});
