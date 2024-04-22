import { parseJSON } from '@masknet/web3-providers/helpers';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import urlcat from 'urlcat';
import { z } from 'zod';

import { env } from '@/constants/env.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { MetricsDownloadResponse } from '@/providers/types/Firefly.js';

const AccountSchema = z.object({
    accessToken: z.string(),
});

const TwitterMetricsSchema = z.object({
    account_id: z.string(),
    client_os: z.string(),
    login_metadata: z.array(
        z.object({
            client_id: z.string(),
            login_time: z.number(),
            access_token: z.string(),
            refresh_token: z.string(),
        }),
    ),
});

const LensMetricsSchema = z.object({
    account_id: z.string(),
    client_os: z.string(),
    login_metadata: z.array(
        z.object({
            token: z.string(),
            address: z.number(),
            login_time: z.string(),
            profile_id: z.string(),
            refresh_token: z.string(),
        }),
    ),
});

const FarcasterMetricsSchema = z.object({
    account_id: z.string(),
    client_os: z.string(),
    fid: z.number(),
    login_time: z.number(),
    signer_public_key: z.string(),
    signer_private_key: z.string(),
});

const MetricsSchema = z.array(z.union([TwitterMetricsSchema, LensMetricsSchema, FarcasterMetricsSchema]));

export async function POST(request: Request) {
    const account = AccountSchema.safeParse(await request.json());
    if (!account.success) return createErrorResponseJSON(account.error.message, { status: StatusCodes.BAD_REQUEST });

    const url = urlcat(FIREFLY_ROOT_URL, '/v1/metrics/download');
    const { data } = await fetchJSON<MetricsDownloadResponse>(url, {
        headers: {
            Authorization: `Bearer ${account.data.accessToken}`,
        },
    });

    // decrypt metrics
    const decrypted = parseJSON<unknown[]>(decrypt(data.ciphertext));

    // validate metrics
    const metrics = MetricsSchema.safeParse(decrypted);
    if (!metrics.success)
        return createErrorResponseJSON(metrics.error.message, { status: StatusCodes.INTERNAL_SERVER_ERROR });

    return createSuccessResponseJSON(metrics.data, { status: StatusCodes.OK });
}

function decrypt(encryptedText: string) {
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(env.internal.SESSION_CIPHER_KEY, 'hex'),
        Buffer.from(env.internal.SESSION_CIPHER_IV, 'hex'),
    );
    return [decipher.update(encryptedText, 'hex', 'utf-8'), decipher.final('utf-8')].join('');
}
