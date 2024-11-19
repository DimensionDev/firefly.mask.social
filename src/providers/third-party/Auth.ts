import { NotImplementedError } from '@/constants/error.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { ThirdPartySession } from '@/providers/third-party/Session.js';
import type { Provider } from '@/providers/types/Auth.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

class ThirdPartyAuth implements Provider<ThirdPartySession> {
    async login(): Promise<ThirdPartySession | null> {
        const response = await fetchJSON<ResponseJSON<ThirdPartySession | null>>('/api/third-party/login', {
            method: 'POST',
        });
        if (!response.success) return null;
        return response.data;
    }

    async logout(): Promise<void> {
        await fetchJSON<void>('/api/third-party/logout', {
            method: 'POST',
        });
    }

    async me(): Promise<Profile> {
        throw new NotImplementedError();
    }
}

export const ThirdPartyAuthProvider = new ThirdPartyAuth();
