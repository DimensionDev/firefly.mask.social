import urlcat from 'urlcat';

import { type ProfilePageSource, Source } from '@/constants/enum.js';
import { SITE_DESCRIPTION, SITE_URL } from '@/constants/index.js';
import { createPageTitleV2 } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { getProfileById } from '@/services/getProfileById.js';
import { getWalletProfileOG } from '@/services/getWalletProfileOG.js';

export async function getProfileOGById(source: ProfilePageSource, profileId: string) {
    if (source === Source.Wallet) return getWalletProfileOG(profileId);
    const profile = await getProfileById(source, profileId).catch(() => null);

    if (!profile) return createSiteMetadata();

    const images = [
        {
            url: getStampAvatarByProfileId(source, profileId) || profile.pfp,
        },
    ];

    const title = createPageTitleV2(`@${profile.handle}`);
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
