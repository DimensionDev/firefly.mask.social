import { LensClient as LensClientSDK } from '@lens-protocol/client';

import { createLensSDK, LocalStorageProvider } from '@/helpers/createLensSDK.js';
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

    override async resumeSession(session: LensSession) {
        const refreshToken = session.refreshToken;
        if (!refreshToken) return;

        const now = Date.now();
        localStorage.setItem(
            'lens.production.credentials',
            JSON.stringify({
                data: {
                    refreshToken,
                },
                metadata: {
                    createdAt: now,
                    updatedAt: now,
                    version: 2,
                },
            }),
        );
    }
}

export const lensSessionHolder = new LensSessionHolder();
