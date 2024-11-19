import type { SessionPayload } from '@/providers/twitter/SessionPayload.js';
import type { Profile } from '@/providers/types/Firefly.js';

export interface Provider {
    /**
     * Login the user.
     */
    login(): Promise<SessionPayload | null>;

    /**
     * Logout the user.
     */
    logout(): Promise<null>;

    /**
     * Get the current logged in user.
     */
    me(): Promise<Profile>;
}
