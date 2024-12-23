import { z } from 'zod';

import { NODE_ENV, STATUS, VERCEL_NEV } from '@/constants/enum.js';
import { bom } from '@/helpers/bom.js';

const InternalEnvSchema = z.object({
    TWITTER_CLIENT_ID: z.string(),
    TWITTER_CLIENT_SECRET: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    APPLE_KEY_ID: z.string(),
    APPLE_TEAM_ID: z.string(),
    APPLE_CLIENT_ID: z.string(),
    APPLE_CLIENT_SECRET: z.string(),

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

    FIREFLY_JWT_SECRET: z.string(),

    // internal use of hubble
    HUBBLE_URL: z.string(),
    HUBBLE_TOKEN: z.string().optional(),

    // s3
    S3_BUCKET: z.string(),
    S3_REGION: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_ACCESS_KEY_SECRET: z.string(),
    S3_HOST: z.string(),
});

const ExternalEnvSchema = z.object({
    NEXT_PUBLIC_VERCEL_ENV: z.nativeEnum(VERCEL_NEV).default(VERCEL_NEV.Development),

    // urls
    NEXT_PUBLIC_SITE_URL: z.string().default('https://firefly.mask.social'),
    NEXT_PUBLIC_FARCASTER_OPENRANK_URL: z.string().default('https://graph.cast.k3l.io'),
    NEXT_PUBLIC_LENS_OPENRANK_URL: z.string().default('https://lens-api.k3l.io'),
    NEXT_PUBLIC_SOLANA_RPC_URL: z.string().default('https://api.mainnet-beta.solana.com'),

    // features
    NEXT_PUBLIC_POLL: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_FRAME: z.nativeEnum(STATUS).default(STATUS.Enabled),
    NEXT_PUBLIC_FRAME_V1: z.nativeEnum(STATUS).default(STATUS.Enabled),
    NEXT_PUBLIC_FRAME_V2: z.nativeEnum(STATUS).default(STATUS.Enabled),
    NEXT_PUBLIC_BLINK: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_OPENGRAPH: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_SCHEDULE_POST: z.nativeEnum(STATUS).default(STATUS.Enabled),
    NEXT_PUBLIC_REACT_DEV_TOOLS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_TIPS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_COMPOSE_GIF: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_CHANNEL_TRENDING: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_FEEDBACK: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_DEVELOPERS: z.nativeEnum(STATUS).default(STATUS.Enabled),
    NEXT_PUBLIC_TELEMETRY: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_TELEMETRY_DEBUG: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_FIREFLY_DEV_API: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_PARTICLE: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_THIRD_PARTY_AUTH: z.nativeEnum(STATUS).default(STATUS.Disabled),

    // hubble
    NEXT_PUBLIC_HUBBLE_URL: z.string().default('https://api.neynar.com:2281'),
    NEXT_PUBLIC_HUBBLE_TOKEN: z.string().optional(),

    // sentry
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_SENTRY_REPORT_URL: z.string().optional(),

    // app url scheme
    NEXT_PUBLIC_FIREFLY_DOWNLOAD_LINK: z.string().default('https://5euxu.app.link/PHvNiyVemIb'),
    NEXT_PUBLIC_FIREFLY_IOS_HOME: z.string().default('firefly://'),
    NEXT_PUBLIC_FIREFLY_ANDROID_HOME: z.string().default('firefly://home'),

    // giphy
    NEXT_PUBLIC_GIPHY_API_KEY: z.string().default('invalid_giphy_api_key'),

    // w3m
    NEXT_PUBLIC_W3M_PROJECT_ID: z.string().default('invalid_w3m_project_id'),

    // particle
    NEXT_PUBLIC_PARTICLE_APP_ID: z.string().optional(),
    NEXT_PUBLIC_PARTICLE_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_PARTICLE_CLIENT_KEY: z.string().optional(),

    NEXT_PUBLIC_ORB_CLUB_API_TOKEN: z.string().default('invalid_orb_club_api_token'),
});

export const env = {
    shared: {
        NODE_ENV: process.env.NODE_ENV as NODE_ENV,
        VERSION: process.env.npm_package_version || process.version,
        COMMIT_HASH: process.env.COMMIT_HASH,
    },
    internal: ((!bom.window || process.env.VITEST) && !process.env.GITHUB_ACTIONS
        ? InternalEnvSchema.parse(process.env)
        : {}) as z.infer<typeof InternalEnvSchema>,
    external: ExternalEnvSchema.parse({
        NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,

        // urls
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_FARCASTER_OPENRANK_URL: process.env.NEXT_PUBLIC_FARCASTER_OPENRANK_URL,
        NEXT_PUBLIC_LENS_OPENRANK_URL: process.env.NEXT_PUBLIC_LENS_OPENRANK_URL,
        NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,

        // features
        NEXT_PUBLIC_POLL: process.env.NEXT_PUBLIC_POLL,
        NEXT_PUBLIC_FRAME: process.env.NEXT_PUBLIC_FRAME,
        NEXT_PUBLIC_THIRD_PARTY_AUTH: process.env.NEXT_PUBLIC_THIRD_PARTY_AUTH,
        NEXT_PUBLIC_BLINK: process.env.NEXT_PUBLIC_BLINK,
        NEXT_PUBLIC_OPENGRAPH: process.env.NEXT_PUBLIC_OPENGRAPH,
        NEXT_PUBLIC_SCHEDULE_POST: process.env.NEXT_PUBLIC_SCHEDULE_POST,
        NEXT_PUBLIC_REACT_DEV_TOOLS: process.env.NEXT_PUBLIC_REACT_DEV_TOOLS,
        NEXT_PUBLIC_TIPS: process.env.NEXT_PUBLIC_TIPS,
        NEXT_PUBLIC_COMPOSE_GIF: process.env.NEXT_PUBLIC_COMPOSE_GIF,
        NEXT_PUBLIC_CHANNEL_TRENDING: process.env.NEXT_PUBLIC_CHANNEL_TRENDING,
        NEXT_PUBLIC_FEEDBACK: process.env.NEXT_PUBLIC_FEEDBACK,
        NEXT_PUBLIC_TELEMETRY: process.env.NEXT_PUBLIC_TELEMETRY,
        NEXT_PUBLIC_TELEMETRY_DEBUG: process.env.NEXT_PUBLIC_TELEMETRY_DEBUG,
        NEXT_PUBLIC_DEVELOPERS: process.env.NEXT_PUBLIC_DEVELOPERS,
        NEXT_PUBLIC_FIREFLY_DEV_API: process.env.NEXT_PUBLIC_FIREFLY_DEV_API,
        NEXT_PUBLIC_PARTICLE: process.env.NEXT_PUBLIC_PARTICLE,

        // hubble
        NEXT_PUBLIC_HUBBLE_URL: process.env.NEXT_PUBLIC_HUBBLE_URL,
        NEXT_PUBLIC_HUBBLE_TOKEN: process.env.NEXT_PUBLIC_HUBBLE_TOKEN,

        // sentry
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        NEXT_PUBLIC_SENTRY_REPORT_URL: process.env.NEXT_PUBLIC_SENTRY_REPORT_URL,

        // app scheme url
        NEXT_PUBLIC_FIREFLY_DOWNLOAD_LINK: process.env.NEXT_PUBLIC_FIREFLY_DOWNLOAD_LINK,
        NEXT_PUBLIC_FIREFLY_IOS_HOME: process.env.NEXT_PUBLIC_FIREFLY_IOS_HOME,
        NEXT_PUBLIC_FIREFLY_ANDROID_HOME: process.env.NEXT_PUBLIC_FIREFLY_ANDROID_HOME,

        // giphy
        NEXT_PUBLIC_GIPHY_API_KEY: process.env.NEXT_PUBLIC_GIPHY_API_KEY,

        // w3m
        NEXT_PUBLIC_W3M_PROJECT_ID: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,

        // particle
        NEXT_PUBLIC_PARTICLE_APP_ID: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
        NEXT_PUBLIC_PARTICLE_PROJECT_ID: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
        NEXT_PUBLIC_PARTICLE_CLIENT_KEY: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,

        NEXT_PUBLIC_ORB_CLUB_API_TOKEN: process.env.NEXT_PUBLIC_ORB_CLUB_API_TOKEN,
    }),
};
