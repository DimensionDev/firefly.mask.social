import { describe, expect, test } from 'vitest';

import { parseURL } from '@/helpers/parseURL.js';

describe('parseURL', () => {
    test('should correctly parse a valid URL', () => {
        const cases = [
            ['https://example.com', 'https://example.com/'],
            ['https://example.com:8080', 'https://example.com:8080/'],
            ['https://example.com/', 'https://example.com/'],
            ['https://example.com/path', 'https://example.com/path'],
            ['https://example.com/path/', 'https://example.com/path/'],
            ['https://example.com/path?query=string', 'https://example.com/path?query=string'],
            ['https://example.com/path?query=string#hash', 'https://example.com/path?query=string#hash'],
        ] as Array<[string, string]>;

        cases.forEach(([input, expectedOutput]) => {
            const result = parseURL(input);
            expect(result).not.toBe(null);
            expect(result!.href).toBe(expectedOutput);
        });
    });
});
