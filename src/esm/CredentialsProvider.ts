import NextAuthCredentialsProvider from 'next-auth/providers/credentials';

export const CredentialsProvider = NextAuthCredentialsProvider as unknown as typeof NextAuthCredentialsProvider.default;
