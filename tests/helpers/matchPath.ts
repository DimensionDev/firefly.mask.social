import { describe, expect, it } from 'vitest';

import { matchPath } from '@/helpers/matchPath.js';

describe('matchPath', () => {
    it('should match a simple path with one parameter (exact match)', () => {
        const result = matchPath('/profile/:id', '/profile/1000');
        expect(result).toEqual({ id: '1000' });
    });

    it('should return null for mismatched paths (exact match)', () => {
        const result = matchPath('/profile/:id', '/profile/1234/extra');
        expect(result).toBeNull();
    });

    it('should match a path with multiple parameters (exact match)', () => {
        const result = matchPath('/profile/:id/xxx/:type', '/profile/1234/xxx/action');
        expect(result).toEqual({ id: '1234', type: 'action' });
    });

    it('should match a simple path with one parameter and extra segments (fuzzy match)', () => {
        const result = matchPath('/profile/:id', '/profile/1000/extra', true);
        expect(result).toEqual({ id: '1000' });
    });

    it('should match a path with multiple parameters and extra segments (fuzzy match)', () => {
        const result = matchPath('/profile/:id/xxx', '/profile/1000/xxx/extra', true);
        expect(result).toEqual({ id: '1000' });
    });

    it('should match a path with multiple parameters and extra segments at the end (fuzzy match)', () => {
        const result = matchPath('/profile/:id/xxx/:type', '/profile/1234/xxx/action/extra', true);
        expect(result).toEqual({ id: '1234', type: 'action' });
    });

    it('should return null if the path has extra segments but fuzzy matching is not enabled', () => {
        const result = matchPath('/profile/:id', '/profile/1000/extra', false);
        expect(result).toBeNull();
    });

    it('should return null if the path has extra segments but fuzzy matching is not enabled (exact match)', () => {
        const result = matchPath('/profile/:id/xxx', '/profile/1000/xxx/extra', false);
        expect(result).toBeNull();
    });

    it('should return null if the path does not match the template at all (fuzzy match)', () => {
        const result = matchPath('/profile/:id/xxx', '/account/1234/xxx/extra', true);
        expect(result).toBeNull();
    });

    it('should return null if the path does not match the template at all (exact match)', () => {
        const result = matchPath('/profile/:id/xxx', '/account/1234/xxx/extra', false);
        expect(result).toBeNull();
    });

    it('should match a path with underscore in parameter names', () => {
        const result = matchPath('/user/:user_id', '/user/abcd1234');
        expect(result).toEqual({ user_id: 'abcd1234' });
    });

    it('should match a path with numeric parameters', () => {
        const result = matchPath('/product/:id', '/product/42');
        expect(result).toEqual({ id: '42' });
    });
});
