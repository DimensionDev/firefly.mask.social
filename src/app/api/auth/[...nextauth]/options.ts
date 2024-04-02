/* cspell:disable */

import { t } from '@lingui/macro';
import type { AuthOptions } from 'next-auth';
import type { Provider } from 'next-auth/providers/index';

import { CredentialsProvider } from '@/esm/CredentialsProvider.js';
import { TwitterProvider } from '@/esm/TwitterProvider.js';

const providers: Provider[] = [
    TwitterProvider({
        id: 'twitter',
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        version: '2.0',
    }),
];

if (process.env.NODE_ENV === 'development') {
    providers.push(
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                username: { label: t`Username`, type: 'text', placeholder: 'firefly' },
                password: { label: t`Password`, type: '' },
            },
            async authorize(credentials: Record<'username' | 'password', string> | undefined) {
                const user = { id: '1', name: 'firefly', email: 'firefly@mask.io' };
                return credentials?.username === user.name && credentials?.password === '' ? user : null;
            },
        }),
    );
}

export const authOptions: AuthOptions = {
    debug: process.env.NODE_ENV === 'development',
    providers,
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
