import { polygon } from 'viem/chains';

import { config } from '@/configs/wagmiClient.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { LensSession } from '@/providers/lens/Session.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

export async function createSessionForProfileId(profileId: string, signal?: AbortSignal): Promise<LensSession> {
    const walletClient = await getWalletClientRequired(config, {
        chainId: polygon.id,
    });
    const { id, text } = await lensSessionHolder.sdk.authentication.generateChallenge({
        for: profileId,
        signedBy: walletClient.account.address,
    });
    const signature = await walletClient.signMessage({
        message: text,
    });

    await lensSessionHolder.sdk.authentication.authenticate({
        id,
        signature,
    });

    const now = Date.now();
    const accessToken = await lensSessionHolder.sdk.authentication.getAccessToken();

    return new LensSession(profileId, accessToken.unwrap(), now, now + THIRTY_DAYS);
}
