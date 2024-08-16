import { safeUnreachable } from '@masknet/kit';

import { Source, WalletSource } from '@/constants/enum.js';
import { isSameConnectionAddress } from '@/helpers/isSameConnectionAddress.js';
import type {
    AllConnections,
    FireflyIdentity,
    FireflyWalletConnection,
    WalletConnection,
} from '@/providers/types/Firefly.js';

function getRelatedFireflyIdentities(
    connection: WalletConnection,
    { lens, farcaster }: AllConnections,
): FireflyIdentity[] {
    const { address, source, platform } = connection;
    switch (source) {
        case WalletSource.Lens:
        case WalletSource.LensContract:
            const relatedLens = lens.connected.filter((x) => isSameConnectionAddress(platform, x.address, address));
            return relatedLens.flatMap((x) => x.lens).map((x) => ({ id: x.id, source: Source.Lens }));
        case WalletSource.Farcaster:
            const relatedFarcaster = farcaster.connected.filter((x) =>
                x.connectedAddresses?.some((addr) => isSameConnectionAddress(platform, addr, address)),
            );
            return relatedFarcaster.map((x) => ({ id: `${x.fid}`, source: Source.Farcaster }));
        case WalletSource.Wallet:
        case WalletSource.Article:
        case WalletSource.Twitter:
        case WalletSource.Firefly:
        case WalletSource.NFTs:
            return [];
        default:
            safeUnreachable(source);
            return [];
    }
}

export function formatWalletConnections(
    walletConnections: WalletConnection[],
    allConnections: AllConnections,
): FireflyWalletConnection[] {
    return walletConnections.map((connection) => ({
        ...connection,
        identities: getRelatedFireflyIdentities(connection, allConnections),
    }));
}
