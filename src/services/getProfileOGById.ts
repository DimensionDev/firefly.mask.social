import urlcat from 'urlcat';

import { type SocialSourceInURL } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { getProfileById } from '@/services/getProfileById.js';

export async function getProfileOGById(sourceInUrl: SocialSourceInURL, profileId: string) {
    const source = resolveSocialSource(sourceInUrl);
    const profile = await getProfileById(source, profileId).catch(() => null);
    if (!profile) return createSiteMetadata();

    const images = [
        {
            url: getStampAvatarByProfileId(source, profileId) || profile.pfp,
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
}
