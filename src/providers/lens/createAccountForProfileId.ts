import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import { polygon } from 'viem/chains';

import { config } from '@/configs/wagmiClient.js';
import { THIRTY_DAYS } from '@/constants/index.js';
import { createLensSDK, getLensCredentials, MemoryStorageProvider } from '@/helpers/createLensSDK.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { LensSession } from '@/providers/lens/Session.js';
import type { Account } from '@/providers/types/Account.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { bindOrRestoreFireflySession } from '@/services/bindOrRestoreFireflySession.js';

export async function createAccountForProfileId(profile: Profile, signal?: AbortSignal) {
    const walletClient = await getWalletClientRequired(config, {
        chainId: polygon.id,
    });

    // it's okay to refresh the page when login firefly profile, if in-memory storage used here.
    const storage = new MemoryStorageProvider();
    const sdk = createLensSDK(storage);

    const { id, text } = await sdk.authentication.generateChallenge({
        for: profile.profileId,
        signedBy: walletClient.account.address,
    });
    const signature = await walletClient.signMessage({
        message: text,
    });

    await sdk.authentication.authenticate({
        id,
        signature,
    });

    const parsed = parseJSON<{
        data: {
            refreshToken: string;
        };
    }>(getLensCredentials(storage));
    if (!parsed?.data.refreshToken) throw new Error('No refresh token found.');

    const now = Date.now();
    const accessToken = await sdk.authentication.getAccessToken();
    const address = await sdk.authentication.getWalletAddress();

    const session = new LensSession(
        profile.profileId,
        accessToken.unwrap(),
        now,
        now + THIRTY_DAYS,
        parsed.data.refreshToken,
        address ?? ZERO_ADDRESS,
    );

    return {
        session,
        profile,
        fireflySession: await bindOrRestoreFireflySession(session, signal),
    } satisfies Account;
}
