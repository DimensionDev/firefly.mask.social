
/* cspell:disable */

import { AuthOptions } from 'next-auth';

import { CredentialsProvider } from '@/esm/CredentialsProvider.js';
import { TwitterProvider } from '@/esm/TwitterProvider.js';

export const authOptions: AuthOptions = {
    debug: process.env.NODE_ENV === 'development',
    providers: [
        TwitterProvider({
            id: 'twitter_legacy',
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
        }),
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
            version: '2.0',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: Record<'username' | 'password', string> | undefined) {
                const user = { id: '1', name: 'jsmith', email: 'smith@jsmith.com' };

                if (credentials?.username === user.name && credentials?.password === 'password') {
                    return user;
                }
                return null;
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, user, account, profile, trigger, session }) => {
            console.log('DEBUG: jwt');
            console.log({
                token,
                user,
                account,
                profile,
                session,
                trigger,
            });

            // export tokens to session
            if (account && session) {
                session[account.provider] = {
                    ...session[account.provider],
                    accessToken: account.accessToken,
                    refreshToken: account.refreshToken,
                };
            }

            if (account?.provider && !token[account.provider]) {
                token[account.provider] = {};
            }

            if (account?.access_token) {
                token[account.provider].accessToken = account.access_token;
            }

            if (account?.refresh_token) {
                token[account.provider].refreshToken = account.refresh_token!;
            }

            return token;
        },
    },
};
