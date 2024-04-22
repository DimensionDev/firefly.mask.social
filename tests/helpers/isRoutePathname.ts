import { describe, expect, test } from 'vitest';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';

describe('isRoutePathname', () => {
    test('should correctly check pathname matching based on criteria', () => {
        const cases = [
            ['users/123', '/users/123', false, false],
            ['/users/123', 'users/123', false, false],
            ['/users/123', '/users/123', false, true],
            ['/users/123', '/users/123/', false, true],
            ['/posts/456', '/users/456/', false, false],
            ['/articles/789', '/articles/', false, true],
            ['/categories/abc/123', '/categories', false, true],
            ['/categories/abc/123', '/categories/', false, true],
            ['/settings//', '/settings', false, true],
            ['/settings', '/settings//', false, false],
            ['/post/123', '/post/:detail', false, true],
            ['/post', '/post/:detail', false, false],
            ['/post/123/photos/123', '/post/:detail', true, false],
            ['/post/123/photos/123', '/post/:detail/photos/:id', true, true],
        ] as Array<[`/${string}`, `/${string}`, boolean, boolean]>;

        cases.forEach(([pathname1, pathname2, exact, expectedResult]) => {
            const result = isRoutePathname(pathname1, pathname2, exact);
            expect(result).toBe(expectedResult);
        });
    });
});
