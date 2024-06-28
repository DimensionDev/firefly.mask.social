import dayjs from 'dayjs';
import { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { mnemonicToAccount } from 'viem/accounts';
import { z } from 'zod';

import { env } from '@/constants/env.js';
import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    name: 'Farcaster SignedKeyRequestValidator',
    version: '1',
    chainId: 10,
    verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553',
} as const;

const SIGNED_KEY_REQUEST_TYPE = [
    { name: 'requestFid', type: 'uint256' },
    { name: 'key', type: 'bytes' },
    { name: 'deadline', type: 'uint256' },
] as const;

const HexStringSchema = z.string().regex(/^0x[a-fA-F0-9]+$/);

export async function POST(request: NextRequest) {
    const { key }: { key: string } = await request.json();
    const publicKey = HexStringSchema.parse(key) as `0x${string}`;

    // valid for one year
    const deadline = dayjs(Date.now()).add(1, 'y').unix();
    const account = mnemonicToAccount(env.internal.FARCASTER_SIGNER_MNEMONIC);
    const signature = await account.signTypedData({
        domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
        types: {
            SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
        },
        primaryType: 'SignedKeyRequest',
        message: {
            key: publicKey,
            deadline: BigInt(deadline),
            requestFid: BigInt(env.internal.FARCASTER_SIGNER_FID),
        },
    });

    const url = urlcat(WARPCAST_ROOT_URL, '/signed-key-requests');
    const { result } = await fetchJSON<{
        result: {
            signedKeyRequest: {
                token: string;
                deeplinkUrl: string;
                key: string;
                requestFid: number;
                state: 'pending' | 'approved' | 'completed';
                isSponsored: boolean;
            };
        };
    }>(url, {
        method: 'POST',
        body: JSON.stringify({
            key: publicKey,
            requestFid: env.internal.FARCASTER_SIGNER_FID,
            signature,
            deadline,
        }),
        signal: request.signal,
    });

    return createSuccessResponseJSON({
        fid: result.signedKeyRequest.requestFid,
        token: result.signedKeyRequest.token,
        timestamp: Date.now(),
        expiresAt: deadline * 1000,
        deeplinkUrl: result.signedKeyRequest.deeplinkUrl,
    });
}
