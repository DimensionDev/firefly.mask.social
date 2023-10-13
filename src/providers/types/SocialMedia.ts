import { Session } from '@/providers/types/Session';

export enum Type {
    Twitter = 'Twitter',
    Farcaster = 'Farcaster',
    Warpcast = 'Warpcast',
}

export interface Provider {
    type: Type;

    /**
     * Initiates the login process for the provider.
     *
     * @returns A promise that resolves to an Auth object upon successful login.
     */
    createSession: () => Promise<Session>;
}
