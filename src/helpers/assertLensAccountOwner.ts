import { t } from '@lingui/macro';
import { memoizePromise } from '@masknet/kit';
import { memoize } from 'lodash-es';

import { config } from '@/configs/wagmiClient.js';
import { Source } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

async function checkResolver(address: string, profile: Profile) {
    const profiles = await LensSocialMediaProvider.getProfilesByAddress(address);
    if (!profiles.some((x) => isSameProfile(x, profile))) {
        throw new Error(t`Cannot continue due to wallet mismatch`);
    }

    return true;
}

const resolver = memoizePromise(memoize, checkResolver, (address, profile) => `${address}_${profile.profileId}`);

export async function assertLensAccountOwner() {
    const walletClient = await getWalletClientRequired(config);
    const currentProfile = getCurrentProfile(Source.Lens);
    if (!currentProfile) return;
    return resolver(walletClient.account.address, currentProfile);
}
