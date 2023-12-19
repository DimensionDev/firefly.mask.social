import { describe, expect, test } from 'vitest';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';

describe('isRoutePathname', () => {
    test('should correctly check pathname matching based on criteria', () => {
        const cases = [
            ['users/123', '/users/123', false],
            ['/users/123', 'users/123', false],
            ['/users/123', '/users/123', true],
            ['/users/123', '/users/123/', true],
            ['/posts/456', '/users/456/', false],
            ['/articles/789', '/articles/', true],
            ['/categories/abc/123', '/categories', true],
            ['/categories/abc/123', '/categories/', true],
            ['/settings//', '/settings', true],
            ['/settings', '/settings//', false],
        ] as Array<[`/${string}`, `/${string}`, boolean]>;

        cases.forEach(([pathname1, pathname2, expectedResult]) => {
            const result = isRoutePathname(pathname1, pathname2);
            expect(result).toBe(expectedResult);
        });
    });
});
