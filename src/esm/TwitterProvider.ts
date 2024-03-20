import NextAuthTwitter from 'next-auth/providers/twitter';

export const TwitterProvider = NextAuthTwitter as unknown as typeof NextAuthTwitter.default;
