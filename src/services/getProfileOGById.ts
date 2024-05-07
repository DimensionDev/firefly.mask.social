import urlcat from 'urlcat';

import type { SocialSourceInURL } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { getProfileById } from '@/services/getProfileById.js';

export async function getProfileOGById(source: SocialSourceInURL, profileId: string) {
    const profile = await getProfileById(resolveSocialSource(source), profileId);
    if (!profile) return createSiteMetadata();

    const images = [
        {
            url: profile.pfp,
        },
    ];

    const title = createPageTitle(`${profile.displayName} (@${profile.handle})`);
    const description = profile.bio ?? '';

    return createSiteMetadata({
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
