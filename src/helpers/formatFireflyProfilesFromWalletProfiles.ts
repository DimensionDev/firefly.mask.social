import { compact } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import type { WalletProfiles } from '@/providers/types/Firefly.js';

export function formatFireflyProfilesFromWalletProfiles(profiles: WalletProfiles) {
    return compact([
        ...profiles.walletProfiles.map((x) => ({
            identity: {
                id: x.address,
                source: Source.Wallet,
            },
            displayName: x.primary_ens || formatEthereumAddress(x.address, 4),
            __origin__: x,
        })),
        ...profiles.farcasterProfiles.map((x) => ({
            identity: {
                id: `${x.fid}`,
                source: Source.Farcaster,
            },
            displayName: x.username,
            __origin__: x,
        })),
        ...profiles.lensProfilesV3.map((x) => ({
            identity: {
                id: x.localName,
                source: Source.Lens,
            },
            displayName: x.localName,
            __origin__: x,
        })),
        ...profiles.twitterProfiles.map((x) => ({
            identity: {
                id: x.twitter_id,
                source: Source.Twitter,
            },
            displayName: x.handle,
            __origin__: x,
        })),
    ]);
}
