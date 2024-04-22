import { getPublicKey, utils } from '@noble/ed25519';
import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { toHex } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';

import { env } from '@/constants/env.js';
import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

const ONE_YEAR = 60 * 60 * 24 * 1000 * 365;

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

export async function POST(request: NextRequest) {
    const privateKey = utils.randomPrivateKey();
    const publicKey: `0x${string}` = `0x${Buffer.from(await getPublicKey(privateKey)).toString('hex')}`;

    // valid for one year
    const deadline = Math.floor(Date.now() / 1000) + ONE_YEAR;
    const account = mnemonicToAccount(env.FARCASTER_SIGNER_MNEMONIC);
    const signature = await account.signTypedData({
        domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
        types: {
            SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
        },
        primaryType: 'SignedKeyRequest',
        message: {
            key: publicKey,
            deadline: BigInt(deadline),
            requestFid: BigInt(env.FARCASTER_SIGNER_FID),
        },
    });

    const url = urlcat(WARPCAST_ROOT_URL, '/signed-key-requests');
    const response = await fetchJSON<{
        result: {
            signedKeyRequest: {
                token: string;
                deeplinkUrl: string;
                key: string;
                requestFid: number;
                state: 'pending' | 'completed';
            };
        };
    }>(url, {
        method: 'POST',
        body: JSON.stringify({
            key: publicKey,
            requestFid: env.FARCASTER_SIGNER_FID,
            signature,
            deadline,
        }),
        signal: request.signal,
    });

    return createSuccessResponseJSON(
        {
            publicKey,
            privateKey: toHex(privateKey),
            fid: response.result.signedKeyRequest.requestFid,
            token: response.result.signedKeyRequest.token,
            timestamp: Date.now(),
            expiresAt: deadline * 1000,
            deeplinkUrl: response.result.signedKeyRequest.deeplinkUrl,
        },
        { status: StatusCodes.OK },
    );
}
