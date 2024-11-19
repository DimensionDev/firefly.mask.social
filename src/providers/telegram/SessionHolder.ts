import { isServer } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { NotImplementedError } from '@/constants/error.js';
import { SITE_URL } from '@/constants/index.js';
import { bom } from '@/helpers/bom.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { TelegramNextAuthProvider } from '@/providers/telegram/NextAuth.js';
import { TelegramSession } from '@/providers/telegram/Session.js';

class TelegramSessionHolder extends SessionHolder<TelegramSession> {
    override resumeSession(session: TelegramSession) {
        this.internalSession = session;
    }

    override fetchWithSession<T>(url: string, options?: RequestInit): Promise<T> {
        throw new NotImplementedError();
    }

    override fetchWithoutSession<T>(url: string, options?: RequestInit) {
        const input = bom.window ? url : urlcat(SITE_URL, url);

        return fetchJSON<T>(input, options, {
            noDefaultContentType: true,
        });
    }

    override removeSession(): void {
        super.removeSession();
        if (!isServer) TelegramNextAuthProvider.logout();
    }
}

export const telegramSessionHolder = new TelegramSessionHolder();
