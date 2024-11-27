/* cspell:disable */

import { t } from '@lingui/macro';
import type { AuthOptions } from 'next-auth';
import type { Provider } from 'next-auth/providers/index';

import { NODE_ENV } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { AppleProvider } from '@/esm/AppleProvider.js';
import { CredentialsProvider } from '@/esm/CredentialsProvider.js';
import { GoogleProvider } from '@/esm/GoogleProvider.js';
import { TwitterProvider } from '@/esm/TwitterProvider.js';

const providers: Provider[] = [
    TwitterProvider({
        id: 'twitter',
        clientId: env.internal.TWITTER_CLIENT_ID,
        clientSecret: env.internal.TWITTER_CLIENT_SECRET,
    }),
    AppleProvider({
        clientId: env.internal.APPLE_CLIENT_ID,
        // will expire at 2025/5/9
        clientSecret: env.internal.APPLE_CLIENT_SECRET,
        checks: 'nonce',
    }),
    GoogleProvider({
        clientId: env.internal.GOOGLE_CLIENT_ID,
        clientSecret: env.internal.GOOGLE_CLIENT_SECRET,
    }),
];

if (env.shared.NODE_ENV === NODE_ENV.Development) {
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
    debug: env.shared.NODE_ENV === NODE_ENV.Development,
    providers,
    cookies: {
        nonce: {
            name: 'next-auth.nonce',
            options: {
                httpOnly: true,
                sameSite: 'none',
                path: '/',
                secure: true,
            },
        },
        pkceCodeVerifier: {
            name: 'next-auth.pkce.code_verifier',
            options: {
                httpOnly: true,
                sameSite: 'none',
                path: '/',
                secure: true,
            },
        },
    },
    callbacks: {
        session: async ({ session, token, user }) => {
            console.log('[session]:', { session, token, user });
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub,
                },
                nonce: token.nonce,
                id_token: token.id_token,
                createdAt: token.iat,
                expiresAt: token.exp,
                type: token.type,
            };
        },
        jwt: async ({ token, account, session, ...rest }) => {
            console.log('[jwt]:', { token, account, session, ...rest });

            // export tokens to session
            if (account && session) {
                session[account.provider] = {
                    ...session[account.provider],
                    oauthToken: account.oauth_token,
                    oauthTokenSecret: account.oauth_token_secret,
                };
            }

            if (account?.provider && !token[account.provider]) {
                token[account.provider] = {};
            }

            if (account?.oauth_token) {
                token[account.provider].oauthToken = account.oauth_token;
            }

            if (account?.oauth_token_secret) {
                token[account.provider].oauthTokenSecret = account.oauth_token_secret!;
            }

            if (account?.id_token) {
                token.id_token = account.id_token;
            }

            // @ts-ignore
            if (rest.profile?.nonce) {
                // @ts-ignore
                token.nonce = rest.profile.nonce;
            }

            if (account?.provider) {
                token.type = account.provider.charAt(0).toUpperCase() + account.provider.slice(1);
            }

            return token;
        },
    },
};
