import { describe, expect, test } from 'vitest';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';
import { createTestWalletClient } from '@/helpers/createTestWalletClient';

describe('generateCustodyBearer', () => {
    test('should generate token', async () => {
        const walletClient = createTestWalletClient(async ({ method, params }) => {
            const [_, account] = params as [string, string];

            expect(method).toBe('personal_sign');
            expect(account).toBe(process.env.VITE_ACCOUNT);
            return 'signed';
        });

        const { token } = await generateCustodyBearer(walletClient);
        // cspell: disable-next-line
        expect(token).toBe('eip191:c2lnbmVk');
    });
});
