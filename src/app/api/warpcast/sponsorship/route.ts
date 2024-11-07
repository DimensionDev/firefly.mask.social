import { getPublicKey, utils } from '@noble/ed25519';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import { type Hex, toHex } from 'viem';
import { z } from 'zod';

import { env } from '@/constants/env.js';
import { createErrorResponseJSON, createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { JWTGenerator } from '@/libs/JWTGenerator.js';
import { generateFarcasterSignatures } from '@/providers/firefly/Auth.js';
import { signedKeyRequests } from '@/providers/warpcast/signedKeyRequests.js';
import { HexString } from '@/schemas/index.js';

const BodySchema = z.object({
    key: HexString,
});

export async function POST(request: NextRequest) {
    const privateKey = utils.randomPrivateKey();
    const publicKey: Hex = `0x${Buffer.from(await getPublicKey(privateKey)).toString('hex')}`;
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) return createErrorResponseJSON(parsed.error.message, { status: StatusCodes.BAD_REQUEST });

    const deadline = dayjs(Date.now()).add(1, 'y').unix();

    const generator = new JWTGenerator();
    const jwt = await generator.generateSHA256JWT(
        {
            client_from: 'web',
        },
        env.internal.FIREFLY_JWT_SECRET,
    );

    const { sponsorSignature, signedKeyRequestSignature, requestFid } = await generateFarcasterSignatures(
        {
            key: parsed.data.key as Hex,
            deadline,
        },
        jwt,
        request.signal,
    );

    const { result } = await signedKeyRequests(
        {
            key: publicKey,
            signature: signedKeyRequestSignature,
            deadline,
            requestFid,
            sponsorship: {
                sponsorFid: requestFid,
                signature: sponsorSignature,
            },
        },
        request.signal,
    );

    return createSuccessResponseJSON({
        result,
        expiresAt: deadline * 1000,
        timestamp: Date.now(),
        token: result.signedKeyRequest.token,
        fid: result.signedKeyRequest.requestFid,
        privateKey: toHex(privateKey),
    });
}
