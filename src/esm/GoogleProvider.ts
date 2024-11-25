import NextGoogleProvider from 'next-auth/providers/google';

export const GoogleProvider = NextGoogleProvider as unknown as typeof NextGoogleProvider.default;
