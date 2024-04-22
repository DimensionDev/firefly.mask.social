import { z } from 'zod';

import { NODE_ENV, STATUS, VERCEL_NEV } from '@/constants/enum.js';

const EnvSchema = z.object({
    NODE_ENV: z.nativeEnum(NODE_ENV),

    TWITTER_CLIENT_ID: z.string(),
    TWITTER_CLIENT_SECRET: z.string(),

    NEXTAUTH_URL: z.string().optional(),
    NEXTAUTH_SECRET: z.string(),

    NEXT_PUBLIC_W3M_PROJECT_ID: z.string(),
    NEXT_PUBLIC_VERCEL_ENV: z.nativeEnum(VERCEL_NEV),

    SESSION_CIPHER_KEY: z.string(),
    SESSION_CIPHER_IV: z.string(),

    VITE_ACCOUNT: z.string().regex(/^0x[0-9a-fA-F]+$/),
    VITE_ACCOUNT_KEY: z.string().regex(/^0x[0-9a-fA-F]+$/),

    FARCASTER_SIGNER_FID: z.string(),
    FARCASTER_SIGNER_MNEMONIC: z.string(),

    HUBBLE_URL: z.string(),
    HUBBLE_TOKEN: z.string(),

    NEXT_PUBLIC_HUBBLE_URL: z.string(),
    NEXT_PUBLIC_HUBBLE_TOKEN: z.string(),

    WEB3_CONSTANTS_RPC: z.string().default('{}'),
    MASK_SENTRY_DSN: z.string().default(''),

    IMGUR_CLIENT_ID: z.string(),
    IMGUR_CLIENT_SECRET: z.string(),

    NEXT_PUBLIC_SITE_URL: z.string().default('https://firefly.mask.social'),

    NEXT_PUBLIC_FRAMES: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_MASK_WEB_COMPONENTS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_REACT_DEV_TOOLS: z.nativeEnum(STATUS).default(STATUS.Disabled),
    NEXT_PUBLIC_FIREFLY_API_URL: z.string().default('https://api.firefly.land'),
});

export const env = EnvSchema.parse(process.env);
