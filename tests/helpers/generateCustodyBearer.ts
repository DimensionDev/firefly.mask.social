import { describe, expect, it } from 'vitest';

import { env } from '@/constants/env.js';
import { createWagmiTestWalletClient } from '@/helpers/createWagmiTestWalletClient.js';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer.js';

describe('generateCustodyBearer', () => {
    it('should generate token', async () => {
        const walletClient = createWagmiTestWalletClient(async ({ method, params }) => {
            const [_, account] = params as [string, string];

            expect(method).toBe('personal_sign');
            expect(account).toBe(env.internal.VITE_ACCOUNT);
            return 'signed';
        });

        const { token } = await generateCustodyBearer(walletClient);

        // cspell: disable-next-line
        expect(token).toBe('eip191:c2lnbmVk');
    });
});
