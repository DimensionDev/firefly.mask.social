import urlcat from 'urlcat';

import type { SocialSourceInURL } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { narrowToSocialSourceInURL } from '@/helpers/narrowToSocialSource.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { getProfileById } from '@/services/getProfileById.js';

export async function getProfileOGById(sourceInUrl: SocialSourceInURL, profileId: string) {
    try {
        const source = resolveSocialSource(narrowToSocialSourceInURL(sourceInUrl));
        const profile = await getProfileById(source, profileId).catch(() => null);
        if (!profile) return createSiteMetadata();

        const images = [
            {
                url: profile.pfp,
            },
        ];

        const title = `@${profile.handle} in Firefly`;
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
    } catch {
        return createSiteMetadata();
    }
}
