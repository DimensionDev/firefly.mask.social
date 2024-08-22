/* cspell:disable */

import { t } from '@lingui/macro';
import type { AuthOptions } from 'next-auth';
import type { Provider } from 'next-auth/providers/index';

import { NODE_ENV } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { CredentialsProvider } from '@/esm/CredentialsProvider.js';
import { TwitterProvider } from '@/esm/TwitterProvider.js';

const providers: Provider[] = [
    TwitterProvider({
        id: 'twitter',
        clientId: env.internal.TWITTER_CLIENT_ID,
        clientSecret: env.internal.TWITTER_CLIENT_SECRET,
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
    callbacks: {
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

            return token;
        },
    },
};
