import urlcat from 'urlcat';

import type { SocialSourceInURL } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

export async function getChannelOGById(source: SocialSourceInURL, channelId: string) {
    const provider = resolveSocialMediaProvider(resolveSocialSource(source));
    const channel = await provider.getChannelById(channelId);
    if (!channel) return createSiteMetadata();

    const images = [
        {
            url: channel.imageUrl,
        },
    ];

    const title = createPageTitle(`${channel.name} (/${channel.id})`);
    const description = channel.description ?? '';

    return createSiteMetadata({
        title,
        openGraph: {
            type: 'website',
            url: urlcat(SITE_URL, getChannelUrl(channel)),
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
