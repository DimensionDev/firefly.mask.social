import { z } from 'zod';

import { NODE_ENV, STATUS, VERCEL_NEV } from '@/constants/enum.js';

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

    S3_BUCKET: z.string(),
    S3_REGION: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_ACCESS_KEY_SECRET: z.string(),
    S3_HOST: z.string(),
});

const ExternalEnvSchema = z.object({
    NEXT_PUBLIC_VERCEL_ENV: z.nativeEnum(VERCEL_NEV).default(VERCEL_NEV.Development),

    NEXT_PUBLIC_W3M_PROJECT_ID: z.string(),

    NEXT_PUBLIC_SITE_URL: z.string().default('https://firefly.mask.social'),
    NEXT_PUBLIC_FIREFLY_API_URL: z.string().default('https://api.firefly.land'),

    NEXT_PUBLIC_FRAMES: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_MASK_WEB_COMPONENTS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_REACT_DEV_TOOLS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_COMPOSE_WARNINGS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_CALENDAR_WIDGET: z.nativeEnum(STATUS).default(STATUS.Disabled),

    // public use of hubble
    NEXT_PUBLIC_HUBBLE_URL: z.string(),
    NEXT_PUBLIC_HUBBLE_TOKEN: z.string().optional(),

    // for sentry
    NEXT_PUBLIC_SENTRY_DSN: z.string(),
    NEXT_PUBLIC_SENTRY_REPORT_URL: z.string().optional(),

    OPENRANK_URL: z.string(),

    // app url scheme
    NEXT_PUBLIC_FIREFLY_IOS_HOME: z.string().optional(),
    NEXT_PUBLIC_FIREFLY_IOS_LOGIN_CONFIRM: z.string().optional(),
    NEXT_PUBLIC_FIREFLY_ANDROID_HOME: z.string().optional(),
    NEXT_PUBLIC_FIREFLY_ANDROID_LOGIN_CONFIRM: z.string().optional(),
});

export const env = {
    shared: {
        NODE_ENV: process.env.NODE_ENV as NODE_ENV,
        VERSION: process.env.npm_package_version || process.version,
        COMMIT_HASH: process.env.COMMIT_HASH,
    },
    internal: (typeof window === 'undefined' ? InternalEnvSchema.parse(process.env) : {}) as z.infer<
        typeof InternalEnvSchema
    >,
    external: ExternalEnvSchema.parse({
        NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,

        NEXT_PUBLIC_W3M_PROJECT_ID: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,

        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_FIREFLY_API_URL: process.env.NEXT_PUBLIC_FIREFLY_API_URL,

        NEXT_PUBLIC_FRAMES: process.env.NEXT_PUBLIC_FRAMES,
        NEXT_PUBLIC_MASK_WEB_COMPONENTS: process.env.NEXT_PUBLIC_MASK_WEB_COMPONENTS,
        NEXT_PUBLIC_CALENDAR_WIDGET: process.env.NEXT_PUBLIC_CALENDAR_WIDGET,
        NEXT_PUBLIC_COMPOSE_WARNINGS: process.env.NEXT_PUBLIC_COMPOSE_WARNINGS,
        NEXT_PUBLIC_REACT_DEV_TOOLS: process.env.NEXT_PUBLIC_REACT_DEV_TOOLS,

        NEXT_PUBLIC_HUBBLE_URL: process.env.NEXT_PUBLIC_HUBBLE_URL,
        NEXT_PUBLIC_HUBBLE_TOKEN: process.env.NEXT_PUBLIC_HUBBLE_TOKEN,

        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        NEXT_PUBLIC_SENTRY_REPORT_URL: process.env.NEXT_PUBLIC_SENTRY_REPORT_URL,

        OPENRANK_URL: process.env.NEXT_PUBLIC_OPENRANK_URL || 'https://graph.cast.k3l.io',

        NEXT_PUBLIC_FIREFLY_IOS_HOME: process.env.NEXT_PUBLIC_FIREFLY_IOS_HOME,
        NEXT_PUBLIC_FIREFLY_IOS_LOGIN_CONFIRM: process.env.NEXT_PUBLIC_FIREFLY_IOS_LOGIN_CONFIRM,
        NEXT_PUBLIC_FIREFLY_ANDROID_HOME: process.env.NEXT_PUBLIC_FIREFLY_ANDROID_HOME,
        NEXT_PUBLIC_FIREFLY_ANDROID_LOGIN_CONFIRM: process.env.NEXT_PUBLIC_FIREFLY_ANDROID_LOGIN_CONFIRM,
    }),
};
