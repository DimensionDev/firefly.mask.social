import { z } from 'zod';

import { NODE_ENV, STATUS, VERCEL_NEV } from '@/constants/enum.js';
import { bom } from '@/helpers/bom.js';

const InternalEnvSchema = z.object({
    TWITTER_CLIENT_ID: z.string(),
    TWITTER_CLIENT_SECRET: z.string(),

    IMGUR_CLIENT_ID: z.string(),
    IMGUR_CLIENT_SECRET: z.string(),

    NEXTAUTH_URL: z.string().optional(),
    NEXTAUTH_SECRET: z.string(),

    SESSION_CIPHER_KEY: z.string(),
    SESSION_CIPHER_IV: z.string(),

    VITE_ACCOUNT: z.string().regex(/^0x[0-9a-fA-F]+$/),
    VITE_ACCOUNT_KEY: z.string().regex(/^0x[0-9a-fA-F]+$/),

    FARCASTER_SIGNER_FID: z.string(),
    FARCASTER_SIGNER_MNEMONIC: z.string(),

    // internal use of hubble
    HUBBLE_URL: z.string(),
    HUBBLE_TOKEN: z.string().optional(),

    // s3
    S3_BUCKET: z.string(),
    S3_REGION: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_ACCESS_KEY_SECRET: z.string(),
    S3_HOST: z.string(),

    // particle
    PARTICLE_SERVER_KEY: z.string(),
});

const ExternalEnvSchema = z.object({
    NEXT_PUBLIC_VERCEL_ENV: z.nativeEnum(VERCEL_NEV).default(VERCEL_NEV.Development),

    // urls
    NEXT_PUBLIC_SITE_URL: z.string().default('https://firefly.mask.social'),
    NEXT_PUBLIC_FIREFLY_API_URL: z.string().default('https://api.firefly.land'),
    NEXT_PUBLIC_FARCASTER_OPENRANK_URL: z.string().default('https://graph.cast.k3l.io'),
    NEXT_PUBLIC_LENS_OPENRANK_URL: z.string().default('https://lens-api.k3l.io'),
    NEXT_PUBLIC_SOLANA_RPC_URL: z.string(),

    // features
    NEXT_PUBLIC_POLL: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_FRAME: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_BLINK: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_OPENGRAPH: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_MASK_WEB_COMPONENTS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_SCHEDULE_POST: z.nativeEnum(STATUS).default(STATUS.Enabled),
    NEXT_PUBLIC_REACT_DEV_TOOLS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_TIPS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_COMPOSE_GIF: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_CHANNEL_TRENDING: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_FEEDBACK: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_DEVELOPERS: z.nativeEnum(STATUS).default(STATUS.Enabled),
    NEXT_PUBLIC_TELEMETRY: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_FIREFLY_DEV_API: z.nativeEnum(STATUS).default(STATUS.Disabled),

    // hubble
    NEXT_PUBLIC_HUBBLE_URL: z.string(),
    NEXT_PUBLIC_HUBBLE_TOKEN: z.string().optional(),

    // sentry
    NEXT_PUBLIC_SENTRY_DSN: z.string(),
    NEXT_PUBLIC_SENTRY_REPORT_URL: z.string().optional(),

    // app url scheme
    NEXT_PUBLIC_FIREFLY_DOWNLOAD_LINK: z.string().default('https://5euxu.app.link/PHvNiyVemIb'),
    NEXT_PUBLIC_FIREFLY_IOS_HOME: z.string().default('firefly://'),
    NEXT_PUBLIC_FIREFLY_ANDROID_HOME: z.string().default('firefly://home'),

    // giphy
    NEXT_PUBLIC_GIPHY_API_KEY: z.string().default(''),

    // w3m
    NEXT_PUBLIC_W3M_PROJECT_ID: z.string(),

    // particle
    NEXT_PUBLIC_PARTICLE_APP_ID: z.string().optional(),
    NEXT_PUBLIC_PARTICLE_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_PARTICLE_CLIENT_KEY: z.string().optional(),
});

export const env = {
    shared: {
        NODE_ENV: process.env.NODE_ENV as NODE_ENV,
        VERSION: process.env.npm_package_version || process.version,
        COMMIT_HASH: process.env.COMMIT_HASH,
    },
    internal: (!bom.window || process.env.VITEST ? InternalEnvSchema.parse(process.env) : {}) as z.infer<
        typeof InternalEnvSchema
    >,
    external: ExternalEnvSchema.parse(process.env),
};
