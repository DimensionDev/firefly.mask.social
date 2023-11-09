/* cspell:disable */

import { AuthOptions } from 'next-auth';
import Github from 'next-auth/providers/github';
import Twitter from 'next-auth/providers/twitter';

export const authOptions = {
    debug: process.env.NODE_ENV === 'development',
    providers:
        process.env.NODE_ENV === 'development'
            ? [
                  Github({
                      clientId: process.env.GITHUB_CLIENT_ID,
                      clientSecret: process.env.GITHUB_CLIENT_SECRET,
                  }),
                  Twitter({
                      id: 'twitter_legacy',
                      clientId: process.env.TWITTER_CLIENT_ID,
                      clientSecret: process.env.TWITTER_CLIENT_SECRET,
                  }),
                  Twitter({
                      clientId: process.env.TWITTER_CLIENT_ID,
                      clientSecret: process.env.TWITTER_CLIENT_SECRET,
                      version: '2.0',
                  }),
              ]
            : [],
    callbacks: {
        jwt: async ({ token, user, account, profile, trigger, session }) => {
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
} satisfies AuthOptions;
