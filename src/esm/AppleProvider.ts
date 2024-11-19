import NextAppleProvider from 'next-auth/providers/apple';

export const AppleProvider = NextAppleProvider as unknown as typeof NextAppleProvider.default;
