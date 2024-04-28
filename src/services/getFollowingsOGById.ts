
import type { SourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { getFollowings } from '@/services/getFollowings.js';

export async function getFollowingsOGById(source: SourceInURL, profileId: string) {
    const followings = await getFollowings(resolveSocialPlatform(source), profileId);
    if (!followings) return createSiteMetadata();

    // const images = [
    //     {
    //         url: followings.pfp,
    //     },
    // ];

    // const title = createPageTitle(`${profile.displayName} (@${profile.handle})`);
    // const description = profile.bio ?? '';
    const title = 'followings'
    const description = 'followings'

    return createSiteMetadata({
        openGraph: {
            type: 'profile',
            // url: urlcat(SITE_URL, getProfileUrl(profile)),
            title,
            description,
            // images,
        },
        twitter: {
            card: 'summary',
            title,
            description,
            // images,
        },
    });
}
