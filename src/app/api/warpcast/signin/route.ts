import urlcat from 'urlcat';
import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server';
import { toHex } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';
import * as ed from '@noble/ed25519';
import { fetchJSON } from '@/helpers/fetchJSON';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON';

const ROOT_URL = 'https://api.warpcast.com/v2';

const ONE_DAY = 60 * 60 * 24 * 1000;

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

export async function POST(req: NextRequest) {
    const privateKey = ed.utils.randomPrivateKey();
    const publicKeyBytes = await ed.getPublicKey(privateKey);
    const key: `0x${string}` = `0x${Buffer.from(publicKeyBytes).toString('hex')}`;

    const appFid = process.env.FARCASTER_SIGNER_FID;
    const account = mnemonicToAccount(process.env.FARCASTER_SIGNER_MNEMONIC);

    // valid for 24 hours
    const deadline = Math.floor(Date.now() / 1000) + ONE_DAY;
    const signature = await account.signTypedData({
        domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
        types: {
            SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
        },
        primaryType: 'SignedKeyRequest',
        message: {
            requestFid: BigInt(appFid),
            key,
            deadline: BigInt(deadline),
        },
    });

    const response = await fetchJSON<{
        data: {
            result: {
                signKeyRequest: {
                    token: string;
                    deeplinkUrl: string;
                };
            };
        };
    }>(urlcat(ROOT_URL, '/signed-key-requests'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            key,
            requestFid: appFid,
            signature,
            deadline,
        }),
    });

    return createSuccessResponseJSON(
        {
            key: toHex(privateKey),
            token: response.data.result.signKeyRequest.token,
            deeplinkUrl: response.data.result.signKeyRequest.deeplinkUrl,
        },
        { status: StatusCodes.OK },
    );
}
