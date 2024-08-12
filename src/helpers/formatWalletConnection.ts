import { safeUnreachable } from '@masknet/kit';

import { FireflyPlatform, Source } from '@/constants/enum.js';
import { isSameAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';
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
        case FireflyPlatform.Lens:
            const relatedLens = lens.connected.filter((x) => isSameAddress(x.address, address));
            return relatedLens.flatMap((x) => x.lens).map((x) => ({ id: x.id, source: Source.Lens }));
        case FireflyPlatform.Farcaster:
            const relatedFarcaster = farcaster.connected.filter((x) =>
                x.connectedAddresses?.some((addr) =>
                    platform === 'solana' ? isSameSolanaAddress(addr, address) : isSameAddress(addr, address),
                ),
            );
            return relatedFarcaster.map((x) => ({ id: `${x.fid}`, source: Source.Farcaster }));
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

export function formatWalletConnections(
    walletConnections: WalletConnection[],
    allConnections: AllConnections,
): FireflyWalletConnection[] {
    return walletConnections.map((connection) => ({
        ...connection,
        identities: getRelatedFireflyIdentities(connection, allConnections),
    }));
}
