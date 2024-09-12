import type { LensClient } from '@lens-protocol/client';
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';

import { THIRTY_DAYS } from '@/constants/index.js';
import { LensSession } from '@/providers/lens/Session.js';

export async function refreshLensSession(sdk: LensClient) {
    const [accessTokenResult, refreshTokenResult, walletAddress] = await Promise.all([
        sdk.authentication.getAccessToken(),
        sdk.authentication.getRefreshToken(),
        sdk.authentication.getWalletAddress(),
    ]);

    // if not authenticated profileId will be null
    // so evaluate profile id after refresh the session
    const profileId = await sdk.authentication.getProfileId();

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
