declare namespace NodeJS {
    interface ProcessEnv {
        TWITTER_CLIENT_ID: string;
        TWITTER_CLIENT_SECRET: string;

        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;

        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;

        NEXT_PUBLIC_W3M_PROJECT_ID: string;
        NEXT_PUBLIC_VERCEL_ENV: 'production' | 'preview' | 'development';

        SESSION_CIPHER_KEY: string;
        SESSION_CIPHER_IV: string;

        VITE_ACCOUNT: `0x${string}`;
        VITE_ACCOUNT_KEY: `0x${string}`;

        FARCASTER_SIGNER_FID: string;
        FARCASTER_SIGNER_MNEMONIC: string;

        HUBBLE_URL: string;
        HUBBLE_TOKEN: string;

        NEXT_PUBLIC_HUBBLE_URL: string;
        NEXT_PUBLIC_HUBBLE_TOKEN: string;

        WEB3_CONSTANTS_RPC: string;
        MASK_SENTRY_DSN: string;

        IMGUR_CLIENT_ID: string;
        IMGUR_CLIENT_SECRET: string;

        NEXT_PUBLIC_SITE_URL?: string;

        NEXT_PUBLIC_FRAMES: 'enabled' | 'disabled';
        NEXT_PUBLIC_MASK_WEB_COMPONENTS: 'enabled' | 'disabled';
        NEXT_PUBLIC_REACT_DEV_TOOLS: 'enabled' | 'disabled';

        NEXT_PUBLIC_REDPACKET_CHANNEL_KEY: string;
        NEXT_PUBLIC_REDPACKET_CHANNEL_URL: string;

        NEXT_PUBLIC_SENTRY_DSN: string;

        S3_HOST: string;
        S3_ACCESS_KEY_SECRET: string;
        S3_ACCESS_KEY_ID: string;
        S3_BUCKET: string;
        S3_REGION: string;
    }
}
