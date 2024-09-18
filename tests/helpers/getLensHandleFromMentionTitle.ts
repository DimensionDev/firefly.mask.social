import { describe, expect, test } from 'vitest';

import { getLensHandleFromMentionTitle } from '@/helpers/getLensHandleFromMentionTitle.js';

describe('getLensHandleFromMentionTitle', () => {
    test('should return lens handle', () => {
        const cases = [
            ['@lens/handle', 'handle'],
            ['@handle.lens', 'handle'],
            ['@club/handle', undefined],
            ['handle', undefined],
        ] as Array<[string, string | undefined]>;

        cases.forEach(([input, expectedOutput]) => {
            expect(getLensHandleFromMentionTitle(input)).toBe(expectedOutput);
        });
    });
});
