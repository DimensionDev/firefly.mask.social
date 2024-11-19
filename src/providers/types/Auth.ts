import type { Profile } from '@/providers/types/SocialMedia.js';

export interface Provider<T> {
    /**
     * Login the user.
     */
    login(): Promise<T | null>;

    /**
     * Logout the user.
     */
    logout(): Promise<void>;

    /**
     * Get the current logged in user.
     */
    me(): Promise<Profile>;
}
