import { NobleEd25519Signer } from '@farcaster/core';
import { safeUnreachable } from '@masknet/kit';
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { compact, groupBy } from 'lodash-es';
import { toBytes } from 'viem';
import { z } from 'zod';

import { CryptoUsage } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { NotAllowedError, UnreachableError } from '@/constants/error.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { resolveSocialSourceFromSessionType } from '@/helpers/resolveSource.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import { FAKE_SIGNER_REQUEST_TOKEN, FarcasterSession } from '@/providers/farcaster/Session.js';
import { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { TwitterSessionPayload } from '@/providers/twitter/SessionPayload.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { getPublicKeyInHex } from '@/helpers/ed25519.js';

const CryptoUsageSchema = z.union([
    z.object({
        usage: z.literal(CryptoUsage.Encrypt),
        accountId: z.string(),
        sessions: z.array(z.string()),
    }),
    z.object({
        usage: z.literal(CryptoUsage.Decrypt),
        cipher: z.string(),
    }),
]);

const TwitterMetricsSchema = z.object({
    account_id: z.string(),
    platform: z.literal('twitter'),
    client_os: z.string(),
    login_metadata: z.array(
        z.object({
            client_id: z.string(),
            login_time: z.number(),
            access_token: z.string(),
            access_token_secret: z.string(),
            consumer_key: z.string(),
            consumer_secret: z.string(),
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

function convertMetricToSession(metric: Metrics[0]) {
    const platform = metric.platform;
    switch (platform) {
        case 'farcaster':
            return metric.login_metadata.map(
                (x) =>
                    new FarcasterSession(
                        `${x.fid}`,
                        x.signer_private_key.startsWith('0x') ? x.signer_private_key : `0x${x.signer_private_key}`,
                        x.login_time,
                        x.login_time,
                        // the signerRequestToken cannot recover from the metric
                        // but it is necessary for distinguish grant by permission session
                        // so we use a fake token here
                        FAKE_SIGNER_REQUEST_TOKEN,
                    ),
            );
        case 'lens':
            return metric.login_metadata.map(
                (x) => new LensSession(x.profile_id, x.token, x.login_time, x.login_time, x.refresh_token, x.address),
            );
        case 'twitter':
            return metric.login_metadata.map(
                (x) =>
                    new TwitterSession(x.client_id, '', x.login_time, x.login_time, {
                        clientId: x.client_id,
                        consumerKey: x.consumer_key,
                        consumerSecret: x.consumer_secret,
                        accessToken: x.access_token,
                        accessTokenSecret: x.access_token_secret,
                    }),
            );
        default:
            safeUnreachable(platform);
            return [];
    }
}

async function convertSessionToMetadata(session: Session): Promise<Metrics[0]['login_metadata'][0] | null> {
    switch (session.type) {
        case SessionType.Lens:
            const lensSession = session as LensSession;
            if (!lensSession.refreshToken) {
                console.error('[metrics] lens found session w/o refresh token.');
                return null;
            }
            return {
                token: lensSession.token,
                address: lensSession.address ?? ZERO_ADDRESS,
                login_time: lensSession.createdAt,
                profile_id: lensSession.profileId,
                refresh_token: lensSession.refreshToken,
            };
        case SessionType.Farcaster:
            const farcasterSession = session as FarcasterSession;
            const signer = new NobleEd25519Signer(toBytes(farcasterSession.token));
            const publicKey = await getPublicKeyInHex(signer);
            if (!publicKey) {
                console.error('[metrics] farcaster found session w/ invalid signer token.');
                return null;
            }
            return {
                fid: Number.parseInt(farcasterSession.profileId, 10),
                login_time: farcasterSession.createdAt,
                signer_public_key: publicKey,
                signer_private_key: farcasterSession.token,
            };
        case SessionType.Twitter:
            const twitterSession = session as TwitterSession;
            const payload = await TwitterSessionPayload.revealPayload(twitterSession.payload);
            return {
                client_id: payload.clientId,
                login_time: twitterSession.createdAt,
                access_token: payload.accessToken,
                access_token_secret: payload.accessTokenSecret,
                consumer_key: payload.consumerKey,
                consumer_secret: payload.consumerSecret,
            };
        case SessionType.Firefly:
            throw new NotAllowedError();
        default:
            safeUnreachable(session.type);
            throw new UnreachableError('session type', session.type);
    }
}

function decrypt(cipherText: string) {
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(env.internal.SESSION_CIPHER_KEY, 'hex'),
        Buffer.from(env.internal.SESSION_CIPHER_IV, 'hex'),
    );
    return [decipher.update(cipherText, 'hex', 'utf-8'), decipher.final('utf-8')].join('');
}

function encrypt(plaintext: string) {
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(env.internal.SESSION_CIPHER_KEY, 'hex'),
        Buffer.from(env.internal.SESSION_CIPHER_IV, 'hex'),
    );
    return [cipher.update(plaintext, 'utf-8', 'hex'), cipher.final('hex')].join('');
}

export async function POST(request: Request) {
    const parsed = CryptoUsageSchema.safeParse(await request.json());
    if (!parsed.success) return createErrorResponseJSON(parsed.error.message, { status: StatusCodes.BAD_REQUEST });

    const { usage } = parsed.data;

    switch (usage) {
        case CryptoUsage.Encrypt: {
            const accountId = parsed.data.accountId;
            const sessions = parsed.data.sessions.map(SessionFactory.createSession);
            const groups = Object.entries(groupBy(sessions, (x) => x.type));
            const metrics = await Promise.all(
                groups.map(async ([type, sessions]) => {
                    const allSettled = await Promise.allSettled(sessions.map(convertSessionToMetadata));
                    return {
                        account_id: accountId,
                        platform: resolveSocialSourceInURL(resolveSocialSourceFromSessionType(type as SessionType)),
                        client_os: 'web',
                        login_metadata: compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null))),
                    };
                }),
            );

            const cipher = encrypt(JSON.stringify(metrics));
            return createSuccessResponseJSON(cipher);
        }
        case CryptoUsage.Decrypt: {
            const decrypted = parseJSON<unknown[]>(decrypt(parsed.data.cipher));

            // validate metrics
            const metrics = MetricsSchema.safeParse(decrypted);
            if (!metrics.success)
                return createErrorResponseJSON(metrics.error.message, { status: StatusCodes.INTERNAL_SERVER_ERROR });

            // convert to sessions
            const sessions = metrics.data.flatMap<FarcasterSession | LensSession | TwitterSession>(
                convertMetricToSession,
            );

            // save consumer secret to KV
            await Promise.all(
                sessions.map(async (session) => {
                    if (session.type !== SessionType.Twitter) return session;
                    const twitterSession = session as TwitterSession;
                    await TwitterSessionPayload.recordPayload(twitterSession.payload);
                    return TwitterSessionPayload.concealPayload(twitterSession.payload);
                }),
            );

            return createSuccessResponseJSON(sessions.map((x) => x.serialize()));
        }
        default:
            return createErrorResponseJSON(`Invalid usage = ${usage}.`, { status: StatusCodes.BAD_REQUEST });
    }
}
