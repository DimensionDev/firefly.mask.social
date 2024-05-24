import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { env } from '@/constants/env.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { parseJSON } from '@/helpers/parseJSON.js';

const CipherSchema = z.object({
    text: z.string(),
});

const TwitterMetricsSchema = z.object({
    account_id: z.string(),
    platform: z.literal('twitter'),
    client_os: z.string(),
    login_metadata: z.array(
        z.object({
            client_id: z.string(),
            login_time: z.number(),
            access_token: z.string(),
            consumer_key: z.string(),
            consumer_secret: z.string(),
            access_token_secret: z.string(),
        }),
    ),
});

const LensMetricsSchema = z.object({
    account_id: z.string(),
    platform: z.literal('lens'),
    client_os: z.string(),
    login_metadata: z.array(
        z.object({
            token: z.string(),
            address: z.string(), // 0xab...cd
            login_time: z.number(),
            // cspell: disable-next-line
            profile_id: z.string(), // 0x049b19
            refresh_token: z.string(),
        }),
    ),
});

const FarcasterMetricsSchema = z.object({
    account_id: z.string(),
    platform: z.literal('farcaster'),
    client_os: z.string(),
    login_metadata: z.array(
        z.object({
            fid: z.number(),
            login_time: z.number(),
            signer_public_key: z.string(),
            signer_private_key: z.string(),
        }),
    ),
});

const MetricsSchema = z.array(z.union([TwitterMetricsSchema, LensMetricsSchema, FarcasterMetricsSchema]));

export type Metrics = z.infer<typeof MetricsSchema>;
export type TwitterMetric = z.infer<typeof TwitterMetricsSchema>;
export type LensMetric = z.infer<typeof LensMetricsSchema>;
export type FarcasterMetric = z.infer<typeof FarcasterMetricsSchema>;

export async function POST(request: Request) {
    const cipher = CipherSchema.safeParse(await request.json());
    if (!cipher.success) return createErrorResponseJSON(cipher.error.message, { status: StatusCodes.BAD_REQUEST });

    // decrypt metrics
    const decrypted = parseJSON<unknown[]>(decrypt(cipher.data.text));

    // validate metrics
    const metrics = MetricsSchema.safeParse(decrypted);
    if (!metrics.success)
        return createErrorResponseJSON(metrics.error.message, { status: StatusCodes.INTERNAL_SERVER_ERROR });

    return createSuccessResponseJSON(metrics.data);
}

function decrypt(cipherText: string) {
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(env.internal.SESSION_CIPHER_KEY, 'hex'),
        Buffer.from(env.internal.SESSION_CIPHER_IV, 'hex'),
    );
    return [decipher.update(cipherText, 'hex', 'utf-8'), decipher.final('utf-8')].join('');
}
