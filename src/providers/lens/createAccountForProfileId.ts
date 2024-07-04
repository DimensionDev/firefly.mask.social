import { polygon } from 'viem/chains';

import { config } from '@/configs/wagmiClient.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { LensSession } from '@/providers/lens/Session.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import type { Account } from '@/providers/types/Account.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { bindOrRestoreFireflySession } from '@/services/bindOrRestoreFireflySession.js';

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

export async function createAccountForProfileId(profile: Profile, signal?: AbortSignal) {
    const walletClient = await getWalletClientRequired(config, {
        chainId: polygon.id,
    });
    const sdk = await lensSessionHolder.createSDK(false);
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

    const now = Date.now();
    const accessToken = await sdk.authentication.getAccessToken();
    const session = new LensSession(profile.profileId, accessToken.unwrap(), now, now + THIRTY_DAYS);

    return {
        session,
        profile,
        fireflySession: await bindOrRestoreFireflySession(session, signal),
    } satisfies Account;
}
