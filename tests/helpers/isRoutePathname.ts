import { describe, expect, test } from 'vitest';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';

describe('isRoutePathname', () => {
    test('should correctly check pathname matching based on criteria', () => {
        // Identical pathnames
        const result1 = isRoutePathname('/users/123', '/users/123/');
        expect(result1).toBe(true);

        // Literal matching
        const result2 = isRoutePathname('/users/123', '/users/123');
        expect(result2).toBe(true);

        // Different pathnames
        const result3 = isRoutePathname('/posts/456', '/users/456/');
        expect(result3).toBe(false);

        // Partial matching
        const result4 = isRoutePathname('/articles/789', '/articles/');
        expect(result4).toBe(true);

        // Unequal length
        const result5 = isRoutePathname('/categories/abc/123', '/categories/');
        expect(result5).toBe(true);

        // Unequal length without ending /
        const result6 = isRoutePathname('/categories/abc/123', '/categories');
        expect(result6).toBe(true);
    });
});
