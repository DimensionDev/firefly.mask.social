import urlcat from 'urlcat';

import type { ProfilePageSource } from '@/constants/enum.js';
import { Source } from '@/constants/enum.js';
import { SITE_DESCRIPTION, SITE_URL } from '@/constants/index.js';
import { createMetadataWalletProfile } from '@/helpers/createMetadataWalletProfile.js';
import { createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { getProfileById } from '@/services/getProfileById.js';

export async function createMetadataProfileById(source: ProfilePageSource, profileId: string) {
    if (source === Source.Wallet) return createMetadataWalletProfile(profileId);
    const profile = await runInSafeAsync(() => getProfileById(source, profileId));

    if (!profile) return createSiteMetadata();

    const images = [
        {
            url: getStampAvatarByProfileId(source, profileId) || profile.pfp,
        },
    ];

    const title = createPageTitleOG(`@${profile.handle}`);
    const description = profile.bio ?? SITE_DESCRIPTION;

    return createSiteMetadata({
        title,
        description,
        openGraph: {
            type: 'profile',
            url: urlcat(SITE_URL, getProfileUrl(profile)),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}
