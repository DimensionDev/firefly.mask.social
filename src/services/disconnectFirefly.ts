import { safeUnreachable } from '@masknet/kit';

import { FireflyPlatform, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { removeAccountByProfileId } from '@/helpers/account.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyIdentity, FireflyWalletConnection } from '@/providers/types/Firefly.js';

function getIdentity(connection: FireflyWalletConnection): FireflyIdentity | null {
    switch (connection.source) {
        case FireflyPlatform.Lens:
        case FireflyPlatform.Farcaster:
            const identity = connection.identities.find((x) => resolveSourceInURL(x.source) === connection.source);
            return identity ? { source: resolveSource(connection.source), id: identity.id } : null;
        case FireflyPlatform.Twitter:
            return { source: resolveSource(connection.source), id: connection.twitterId };
        case FireflyPlatform.Article:
        case FireflyPlatform.Firefly:
        case FireflyPlatform.NFTs:
            return null;
        case FireflyPlatform.Wallet:
            return { source: Source.Wallet, id: connection.address };
        default:
            safeUnreachable(connection.source);
            return null;
    }
}

export async function disconnectFirefly(connection: FireflyWalletConnection) {
    const identity = getIdentity(connection);
    if (!identity) throw new Error('No profile identity found for disconnecting wallet');

    await FireflySocialMediaProvider.disconnectAccount(identity);
    await FireflySocialMediaProvider.disconnectWallet(connection.address);

    const source = identity.source as SocialSource;

    if (SORTED_SOCIAL_SOURCES.includes(source)) {
        await removeAccountByProfileId(source, identity.id);
    }
}
