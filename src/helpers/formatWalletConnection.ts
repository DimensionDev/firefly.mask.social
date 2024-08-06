import { safeUnreachable } from '@masknet/kit';

import { FireflyPlatform, Source } from '@/constants/enum.js';
import { removeAccountByProfileId } from '@/helpers/account.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import type { AllConnections, FireflyWalletConnection, WalletConnection } from '@/providers/types/Firefly.js';

function fillWithRelatedPlatforms(address: string, source: FireflyPlatform, { lens, farcaster }: AllConnections) {
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
        platforms: fillWithRelatedPlatforms(connection.address, connection.source, allConnections),
    }));
}

export async function updateAccountConnection(platform: FireflyPlatform, identity: string) {
    const source = resolveSourceFromUrl(platform);
    switch (source) {
        case Source.Lens:
        case Source.Farcaster:
        case Source.Twitter:
            await removeAccountByProfileId(source, identity);
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

export function getFireflyIdentityForDisconnect(connection: FireflyWalletConnection) {
    switch (connection.source) {
        case FireflyPlatform.Lens:
        case FireflyPlatform.Farcaster:
            const platform = connection.platforms.find((x) => resolveSourceInURL(x.source) === connection.source);
            return platform ? { source: connection.source, identity: platform.identity! } : null;
        case FireflyPlatform.Twitter:
            return { source: connection.source, identity: connection.twitterId };
        case FireflyPlatform.Article:
        case FireflyPlatform.Firefly:
        case FireflyPlatform.NFTs:
        case FireflyPlatform.Wallet:
            return { source: FireflyPlatform.Wallet, identity: connection.address };
        default:
            safeUnreachable(connection.source);
            return null;
    }
}
