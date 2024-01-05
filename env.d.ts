declare namespace NodeJS {
    interface ProcessEnv {
        APP_VERSION: string;
        COMMIT_HASH: string;

        TWITTER_CLIENT_ID: string;
        TWITTER_CLIENT_SECRET: string;

        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;

        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;

        NEXT_PUBLIC_W3M_PROJECT_ID: string;
        NEXT_PUBLIC_VERCEL_ENV: 'production' | 'preview' | 'development';

        VITE_ACCOUNT: `0x${string}`;
        VITE_ACCOUNT_KEY: `0x${string}`;

        FARCASTER_SIGNER_FID: string;
        FARCASTER_SIGNER_MNEMONIC: string;

        NEXT_PUBLIC_FIREFLY_HUBBLE_URL: string;
        NEXT_PUBLIC_FIREFLY_API_URL: string;
        WEB3_CONSTANTS_RPC: string;
        MASK_SENTRY_DSN: string;

        IMGUR_CLIENT_ID: string;
        IMGUR_CLIENT_SECRET: string;

        NEXT_PUBLIC_MASK_WEB_COMPONENTS: 'enabled' | 'disabled';
    }
}
