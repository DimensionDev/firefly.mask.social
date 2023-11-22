import { isSameAddress } from '@masknet/web3-shared-base';
import { describe, expect, test } from 'vitest';

const A = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const B = '0xc778417E063141139Fce010982780140Aa0cD5Ab';

describe('isSameAddress', () => {
    test('should return true for same address', () => {
        expect(isSameAddress(A, A)).toBeTruthy();
        expect(isSameAddress(A, A.toLowerCase())).toBeTruthy();
    });

    test('should return false for different address', () => {
        expect(isSameAddress(A, B)).toBeFalsy();
        expect(isSameAddress(A, B.toLowerCase())).toBeFalsy();
    });
});
