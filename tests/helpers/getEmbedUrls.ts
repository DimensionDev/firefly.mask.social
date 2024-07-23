import { describe, expect, test } from 'vitest';

import { getEmbedUrls } from '@/helpers/getEmbedUrls.js';

describe('getEmbedUrls', () => {
    test('should correctly parse a embed url', () => {
        const cases = [
            [
                `thank you vitalik.eth — i appreciate you collecting my article on /wildcardclub 

the article can be read here:

https://paragraph.xyz/@nfa/wildcard-reflections`,
                ['https://paragraph.xyz/@nfa/wildcard-reflections'],
            ],
        ] as Array<[string, string[]]>;

        cases.forEach(([input, expectedOutput]) => {
            const result = getEmbedUrls(input, []);
            expect(result).not.toBe(null);
            result.forEach((x, i) => {
                expect(x).toBe(expectedOutput[i]);
            });
        });
    });
});
