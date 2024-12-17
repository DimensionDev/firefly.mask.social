import { describe, expect, it } from 'vitest';

import { resolveSearchKeyword } from '@/helpers/resolveSearchKeyword.js';

describe('resolveSearchKeyword', () => {
    it('should parse basic from: pattern with space', () => {
        expect(resolveSearchKeyword('from: abc hello')).toEqual({
            handle: 'abc',
            content: 'hello',
        });
    });

    it('should parse from: pattern without space', () => {
        expect(resolveSearchKeyword('from:abc hello')).toEqual({
            handle: 'abc',
            content: 'hello',
        });
    });

    it('should parse from: pattern with no content', () => {
        expect(resolveSearchKeyword('from:abchello')).toEqual({
            handle: 'abchello',
            content: '',
        });
    });

    it('should parse plain text without from:', () => {
        expect(resolveSearchKeyword('hello')).toEqual({
            handle: null,
            content: 'hello',
        });
    });

    it('should parse from: pattern with multiple spaces after colon', () => {
        expect(resolveSearchKeyword('from:abc  hello')).toEqual({
            handle: 'abc',
            content: 'hello',
        });
    });

    it('should parse from: pattern with spaces before handle', () => {
        expect(resolveSearchKeyword('from:   abc hello')).toEqual({
            handle: 'abc',
            content: 'hello',
        });
    });

    it('should parse from: pattern with multiple words in content', () => {
        expect(resolveSearchKeyword('from:   abc hello world')).toEqual({
            handle: 'abc',
            content: 'hello world',
        });
    });

    it('should handle empty string', () => {
        expect(resolveSearchKeyword('')).toEqual({
            handle: null,
            content: '',
        });
    });

    it('should handle only "from:" without handle', () => {
        expect(resolveSearchKeyword('from:')).toEqual({
            handle: null,
            content: 'from:',
        });
    });

    it('should handle special characters in handle', () => {
        expect(resolveSearchKeyword('from:@abc.123 hello')).toEqual({
            handle: '@abc.123',
            content: 'hello',
        });
    });

    it('should handle multiple from: in content', () => {
        expect(resolveSearchKeyword('from:abc hello from:xyz')).toEqual({
            handle: 'abc',
            content: 'hello from:xyz',
        });
    });

    it('should handle leading and trailing spaces', () => {
        expect(resolveSearchKeyword('  from:abc hello  ')).toEqual({
            handle: 'abc',
            content: 'hello',
        });
    });

    it('should handle case sensitivity', () => {
        expect(resolveSearchKeyword('FROM:abc hello')).toEqual({
            handle: null,
            content: 'FROM:abc hello',
        });
    });
});
