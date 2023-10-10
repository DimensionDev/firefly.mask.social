import { toBytes } from 'viem';
import { WalletClient } from 'wagmi';
import canonicalize from 'canonicalize';

export interface CustodyPayload {
    method: 'generateToken';
    params: {
        timestamp: number;
        expiresAt: number;
    };
}

const ONE_DAY = 60 * 60 * 24 * 1000;

function createPayload(): CustodyPayload {
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
 * Generate a FC custody bearer token. (wagmi connection required)
 * @returns
 */
export async function generateCustodyBearer(client: WalletClient) {
    const message = canonicalize(createPayload());
    if (!message) throw new Error('Failed to serialize payload.');

    const signature = await client.signMessage({
        message,
    });
    const signatureBase64 = Buffer.from(toBytes(signature)).toString('base64');

    return `eip191:${signatureBase64}`;
}
