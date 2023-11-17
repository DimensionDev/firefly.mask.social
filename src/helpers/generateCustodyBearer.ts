import { toBytes } from 'viem';
import type { WalletClient } from 'wagmi';
import { canonicalize } from '@/esm/canonicalize.js';

export interface CustodyPayload {
    method: 'generateToken';
    params: {
        timestamp: number;
        expiresAt: number;
    };
}

const ONE_DAY = 60 * 60 * 24 * 1000;

function createCustodyPayload(): CustodyPayload {
    const timestamp = Date.now();

    return {
        method: 'generateToken',
        params: {
            timestamp,
            expiresAt: timestamp + ONE_DAY,
        },
    };
}

/**
 * Generate a FC custody bearer (wagmi connection required)
 * @returns
 */
export async function generateCustodyBearer(client: WalletClient) {
    const payload = createCustodyPayload();
    const message = canonicalize(payload);
    if (!message) throw new Error('Failed to serialize payload.');

    const signature = await client.signMessage({
        message,
    });

    return {
        payload,
        token: `eip191:${Buffer.from(toBytes(signature)).toString('base64')}`,
    };
}
