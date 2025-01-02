import { t } from '@lingui/macro';

import { config } from '@/configs/wagmiClient.js';
import { Source } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { memoizePromise } from '@/helpers/memoizePromise.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

async function checkResolver(address: string, profile: Profile) {
    const profiles = await LensSocialMediaProvider.getProfilesByAddress(address);
    if (!profiles.some((x) => isSameProfile(x, profile))) {
        throw new Error(t`Cannot continue due to wallet mismatch.`);
    }

    return true;
}

const resolver = memoizePromise(checkResolver, (address, profile) => `${address}_${profile.profileId}`);

export async function assertLensAccountOwner() {
    const client = await getWalletClientRequired(config);
    const currentProfile = getCurrentProfile(Source.Lens);
    if (!currentProfile) return;
    return resolver(client.account.address, currentProfile);
}
