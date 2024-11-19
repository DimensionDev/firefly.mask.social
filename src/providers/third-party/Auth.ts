import { NotImplementedError } from '@/constants/error.js';
import type { ThirdPartySession } from '@/providers/third-party/Session.js';
import type { Provider } from '@/providers/types/Auth.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

class ThirdPartyAuth implements Provider<ThirdPartySession> {
    async login(): Promise<ThirdPartySession | null> {
        throw new NotImplementedError();
    }

    async logout(): Promise<void> {
        throw new NotImplementedError();
    }

    async me(): Promise<Profile> {
        throw new NotImplementedError();
    }
}

export const ThirdPartyAuthProvider = new ThirdPartyAuth();
