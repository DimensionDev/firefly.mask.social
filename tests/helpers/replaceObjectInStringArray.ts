import { describe, expect, it } from 'vitest';

import { replaceObjectInStringArray } from '@/helpers/replaceObjectInStringArray.js';

describe('replaceObjectInStringArray', () => {
    it('should replace matching substrings with corresponding objects', () => {
        const str = 'Hello worldAAabcbbccc';
        const params = { AA: { a: 1 }, bb: { b: 2 } };
        const result = replaceObjectInStringArray(str, params);

        expect(result).toEqual(['Hello world', { a: 1 }, 'abc', { b: 2 }, 'ccc']);
    });

    it('should handle spaces correctly', () => {
        const str = 'Hello world AA abc bb ccc';
        const params = { AA: { a: 1 }, bb: { b: 2 } };
        const result = replaceObjectInStringArray(str, params);

        expect(result).toEqual(['Hello world ', { a: 1 }, ' abc ', { b: 2 }, ' ccc']);
    });

    it('should return the string as is if no matches are found', () => {
        const str = 'Hello world xyz';
        const params = { AA: { a: 1 }, bb: { b: 2 } };
        const result = replaceObjectInStringArray(str, params);

        expect(result).toEqual(['Hello world xyz']);
    });

    it('should handle an empty string', () => {
        const str = '';
        const params = { AA: { a: 1 }, bb: { b: 2 } };
        const result = replaceObjectInStringArray(str, params);

        expect(result).toEqual(['']);
    });

    it('should handle an empty params object', () => {
        const str = 'Hello world AA abc bb ccc';
        const params = {};
        const result = replaceObjectInStringArray(str, params);

        expect(result).toEqual(['Hello world AA abc bb ccc']);
    });
});
