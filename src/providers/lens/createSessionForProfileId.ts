import { polygon } from 'viem/chains';

import { config } from '@/configs/wagmiClient.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { LensSession } from '@/providers/lens/Session.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';

export async function createSessionForProfileId(profileId: string): Promise<LensSession> {
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
    const accessToke = await lensSessionHolder.sdk.authentication.getAccessToken();

    return new LensSession(
        profileId,
        accessToke.unwrap(),
        now,
        now + 1000 * 60 * 60 * 24 * 30, // 30 days
    );
}

export async function createSessionForProfileIdFirefly(profileId: string, signal?: AbortSignal) {
    const session = await createSessionForProfileId(profileId);

    try {
        const fireflySession = await FireflySession.from(session, signal);
        if (fireflySession) {
            fireflySessionHolder.resumeSession(fireflySession);
        }
    } catch (error) {
        console.error('[login lens] Failed to resume firefly session:', error);
    }

    return session;
}
