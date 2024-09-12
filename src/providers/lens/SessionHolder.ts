import { LensClient as LensClientSDK } from '@lens-protocol/client';
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';

import { THIRTY_DAYS } from '@/constants/index.js';
import {
    createLensSDK,
    LocalStorageProvider,
    removeLensCredentials,
    setLensCredentials,
} from '@/helpers/createLensSDK.js';
import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { LensSession } from '@/providers/lens/Session.js';

class LensSessionHolder extends SessionHolder<LensSession> {
    private lensClientSDK: LensClientSDK | null = null;

    get sdk() {
        if (!this.lensClientSDK) {
            this.lensClientSDK = createLensSDK(new LocalStorageProvider());
        }
        return this.lensClientSDK;
    }

    override async refreshSession() {
        this.assertSession();

        const [accessTokenResult, refreshTokenResult, walletAddress] = await Promise.all([
            lensSessionHolder.sdk.authentication.getAccessToken(),
            lensSessionHolder.sdk.authentication.getRefreshToken(),
            lensSessionHolder.sdk.authentication.getWalletAddress(),
        ]);

        const profileId = lensSessionHolder.session?.profileId;
        const accessToken = accessTokenResult.unwrap();
        const refreshToken = refreshTokenResult.unwrap();
        const now = Date.now();

        const session =
            accessToken && refreshToken && walletAddress && profileId
                ? new LensSession(
                      profileId,
                      accessToken,
                      now,
                      now + THIRTY_DAYS,
                      refreshToken,
                      walletAddress ?? ZERO_ADDRESS,
                  )
                : null;
        if (!session) throw new Error('Failed to refresh session');

        return session;
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
