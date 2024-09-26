import { memoizePromise } from '@masknet/kit';
import { memoize } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

async function resolver(addressOrEns: string) {
    const identity = { id: addressOrEns, source: Source.Wallet } as const;
    const profiles = await FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity);
    const { walletProfile } = resolveFireflyProfiles(identity, profiles);

    return walletProfile;
}

export const getWalletProfileByAddressOrEns = memoizePromise(memoize, resolver, (addressOrEns) => addressOrEns);
