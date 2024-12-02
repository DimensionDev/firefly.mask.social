import { safeUnreachable } from '@masknet/kit';

import { type SocialSource, Source, WalletSource } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveSourceFromWalletSource } from '@/helpers/resolveSource.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import type { FireflyIdentity, FireflyWalletConnection } from '@/providers/types/Firefly.js';
import { removeAccountByProfileId } from '@/services/account.js';
import { downloadSessions, uploadSessions } from '@/services/metrics.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

function getIdentity(connection: FireflyWalletConnection): FireflyIdentity | null {
    switch (connection.source) {
        case WalletSource.Lens:
        case WalletSource.Farcaster:
        case WalletSource.LensContract:
            const identity = connection.identities.find(
                (x) => x.source === resolveSourceFromWalletSource(connection.source),
            );
            return identity ? { source: resolveSourceFromWalletSource(connection.source), id: identity.id } : null;
        case WalletSource.Twitter:
            return { source: resolveSourceFromWalletSource(connection.source), id: connection.twitterId };
        case WalletSource.Article:
        case WalletSource.NFTs:
        case WalletSource.Particle:
            return null;
        case WalletSource.Firefly:
        case WalletSource.Wallet:
            return { source: Source.Wallet, id: connection.address };
        default:
            safeUnreachable(connection.source);
            return null;
    }
}

async function removeFireflyMetrics(profileId: number | string, signal?: AbortSignal) {
    const session = useFireflyStateStore.getState().currentProfileSession as FireflySession | null;
    if (!session) return;

    const syncedSessions = await downloadSessions(session, signal);
    const sessions = syncedSessions.filter((x) => x.profileId !== profileId);
    await uploadSessions('override', session, sessions, signal);
}

export async function disconnectFirefly(connection: FireflyWalletConnection) {
    const identity = getIdentity(connection);
    if (identity) await FireflyEndpointProvider.disconnectAccount(identity);

    await FireflyEndpointProvider.disconnectWallet(connection.address);

    if (!identity) return;

    const source = identity.source as SocialSource;

    if (SORTED_SOCIAL_SOURCES.includes(source)) {
        await removeAccountByProfileId(source, identity.id);
    }

    await runInSafeAsync(async () => {
        await removeFireflyMetrics(identity.id);
    });
}
