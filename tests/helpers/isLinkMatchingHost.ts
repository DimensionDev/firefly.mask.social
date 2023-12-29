import { describe, expect, test } from 'vitest';

import { isLinkMatchingHost } from '@/helpers/isLinkMatchingHost.js';

describe('isLinkMatchingHost', () => {
    test('should return true for a matching host', () => {
        const cases = [
            ['https://www.example.com/page', 'www.example.com', true],
            ['https://subdomain.example.com/page', 'example.com', false],
        ] as Array<[string, string, boolean?]>;

        cases.forEach(([link, host, strict]) => {
            expect(isLinkMatchingHost(link, host, strict)).toBe(true);
        });
    });

    test('should return false for a matching host', () => {
        const cases = [
            ['ftp://www.example.com/page', 'www.example.com', true],
            ['ftp://subdomain.example.com/page', 'example.com', true],
            ['invalid-url', 'www.example.com', true],
            ['ftp://www.example.com/page', 'www.example.com', true],
        ] as Array<[string, string, boolean?]>;

        cases.forEach(([link, host, strict]) => {
            expect(isLinkMatchingHost(link, host, strict)).toBe(false);
        });
    });
});
