import { NotImplementedError } from '@/constants/error.js';
import type { TelegramSession } from '@/providers/telegram/Session.js';
import { telegramSessionHolder } from '@/providers/telegram/SessionHoder.js';
import { type Provider } from '@/providers/types/NextAuthProvider.js';
import { type Profile } from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

class TelegramNextAuth implements Provider<TelegramSession> {
    async login(): Promise<TelegramSession | null> {
        const response = await telegramSessionHolder.fetch<ResponseJSON<TelegramSession>>('/api/telegram/login', {
            method: 'POST',
        });
        if (!response.success) return null;
        return response.data;
    }

    async logout(): Promise<null> {
        await telegramSessionHolder.fetch<ResponseJSON<TelegramSession>>('/api/telegram/logout', {
            method: 'POST',
        });
        return null;
    }

    async me(): Promise<Profile> {
        throw new NotImplementedError();
    }
}

export const TelegramNextAuthProvider = new TelegramNextAuth();
