import { safeUnreachable } from '@masknet/kit';

import { FireflyPlatform, Source } from '@/constants/enum.js';
import { removeAccountByProfileId } from '@/helpers/account.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import type {
    AllConnections,
    FireflyIdentity,
    FireflyWalletConnection,
    WalletConnection,
} from '@/providers/types/Firefly.js';

function getFireflyIdentities(connection: WalletConnection, { lens, farcaster }: AllConnections) {
    const { address, source } = connection;
    switch (source) {
        case FireflyPlatform.Lens:
            const relatedLens = lens.connected.filter((x) => isSameAddress(x.address, address));
            return relatedLens.flatMap((x) => x.lens).map((x) => ({ identity: x.id, source: Source.Lens }));
        case FireflyPlatform.Farcaster:
            const relatedFarcaster = farcaster.connected.filter((x) =>
                x.connectedAddresses?.some((addr) => isSameAddress(addr, address)),
            );
            return relatedFarcaster.map((x) => ({ identity: `${x.fid}`, source: Source.Farcaster }));
        case FireflyPlatform.Wallet:
        case FireflyPlatform.Article:
        case FireflyPlatform.Twitter:
        case FireflyPlatform.Firefly:
        case FireflyPlatform.NFTs:
            return [];
        default:
            safeUnreachable(source);
            return [];
    }
}

export function formatWalletConnections(walletConnections: WalletConnection[], allConnections: AllConnections) {
    return walletConnections.map((connection) => ({
        ...connection,
        identities: getFireflyIdentities(connection, allConnections),
    }));
}

export async function updateAccountConnection(identity: FireflyIdentity) {
    const { id, source } = identity;

    switch (source) {
        case Source.Lens:
        case Source.Farcaster:
        case Source.Twitter:
            await removeAccountByProfileId(source, id);
            break;
        case Source.Wallet:
        case Source.Article:
        case Source.NFTs:
        case Source.Firefly:
            break;
        default:
            safeUnreachable(source);
            break;
    }
}

export function getFireflyIdentityForDisconnect(connection: FireflyWalletConnection): FireflyIdentity | null {
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
        case FireflyPlatform.Wallet:
            return { source: Source.Wallet, id: connection.address };
        default:
            safeUnreachable(connection.source);
            return null;
    }
}
