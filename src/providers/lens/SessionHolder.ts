import { LensClient as LensClientSDK } from '@lens-protocol/client';

import { createLensSDK, LocalStorageProvider, setLensCredentials } from '@/helpers/createLensSDK.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { LensSession } from '@/providers/lens/Session.js';

export class LensSessionHolder extends SessionHolder<LensSession> {
    get sdk() {
        return createLensSDK(new LocalStorageProvider());
    }

    override resumeSession(session: LensSession) {
        if (session.refreshToken) setLensCredentials(localStorage, session);
        super.resumeSession(session);
    }
}

export const lensSessionHolder = new LensSessionHolder();
