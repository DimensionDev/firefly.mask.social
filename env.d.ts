declare namespace NodeJS {
    interface ProcessEnv {
        TWITTER_CLIENT_ID: string;
        TWITTER_CLIENT_SECRET: string;

        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;

        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;

        NEXT_PUBLIC_W3M_PROJECT_ID: string;
    }
}
