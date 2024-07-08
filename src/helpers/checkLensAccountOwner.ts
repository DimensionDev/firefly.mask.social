import { t } from '@lingui/macro';
import { memoizePromise } from '@masknet/kit';
import { memoize } from 'lodash-es';

import { isSameProfile } from '@/helpers/isSameProfile.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

async function resolver(address: string, profile: Profile) {
    const profiles = await LensSocialMediaProvider.getProfilesByAddress(address);
    if (!profiles.some((x) => isSameProfile(x, profile))) {
        throw new Error(t`Cannot continue due to wallet mismatch`);
    }

    return true;
}

export const checkLensAccountOwner = memoizePromise(
    memoize,
    resolver,
    (address, profile) => `${address}_${profile.profileId}`,
);
