import urlcat from 'urlcat';

import { NetworkType, Source } from '@/constants/enum.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { FireflyIdentity, WalletProfileResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

function getQueryKey(identity: FireflyIdentity) {
    switch (identity.source) {
        case Source.Lens:
            return 'lensHandle';
        case Source.Farcaster:
            return 'fid';
        case Source.Twitter:
            return 'twitterId';
        case Source.Wallet:
            switch (identity.networkType) {
                case NetworkType.Ethereum:
                    return 'walletAddress';
                case NetworkType.Solana:
                    return 'solanaWalletAddress';
                default:
                    return 'walletAddress';
            }
        default:
            return '';
    }
}

export async function getAllPlatformProfileFromFirefly(identity: FireflyIdentity) {
    const queryKey = getQueryKey(identity);

    const url = urlcat(
        settings.FIREFLY_ROOT_URL,
        '/v2/wallet/profile',
        queryKey ? { [`${queryKey}`]: identity.id } : {},
    );

    return fireflySessionHolder.fetch<WalletProfileResponse>(url, {
        method: 'GET',
    });
}
