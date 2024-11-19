import { isServer } from '@tanstack/react-query';

import { NotAllowedError } from '@/constants/error.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { ThirdPartySession } from '@/providers/third-party/Session.js';
import { TwitterAuthProvider } from '@/providers/twitter/Auth.js';

class ThirdPartySessionHolder extends SessionHolder<ThirdPartySession> {
    override resumeSession(session: ThirdPartySession) {
        this.internalSession = session;
    }

    override fetchWithSession<T>(url: string, options?: RequestInit): Promise<T> {
        throw new NotAllowedError();
    }

    override fetchWithoutSession<T>(url: string, options?: RequestInit): Promise<T> {
        throw new NotAllowedError();
    }

    override removeSession(): void {
        super.removeSession();
        if (!isServer) TwitterAuthProvider.logout();
    }
}

export const thirdPartySessionHolder = new ThirdPartySessionHolder();
