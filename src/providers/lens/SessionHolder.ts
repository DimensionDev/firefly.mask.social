import { LensClient as LensClientSDK } from '@lens-protocol/client';

import {
    createLensSDK,
    LocalStorageProvider,
    removeLensCredentials,
    setLensCredentials,
} from '@/helpers/createLensSDK.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import type { LensSession } from '@/providers/lens/Session.js';

export class LensSessionHolder extends SessionHolder<LensSession> {
    private lensClientSDK: LensClientSDK | null = null;

    get sdk() {
        if (!this.lensClientSDK) {
            this.lensClientSDK = createLensSDK(new LocalStorageProvider());
        }
        return this.lensClientSDK;
    }

    override resumeSession(session: LensSession) {
        if (session.refreshToken) {
            const storage = new LocalStorageProvider();

            // overwrite lens credentials in local storage
            setLensCredentials(storage, session);

            // renew the sdk instance, since it could possess the old credentials
            this.lensClientSDK = createLensSDK(storage);
        }
        super.resumeSession(session);
    }

    override removeSession(): void {
        removeLensCredentials(new LocalStorageProvider());
        super.removeSession();
    }
}

export const lensSessionHolder = new LensSessionHolder();
