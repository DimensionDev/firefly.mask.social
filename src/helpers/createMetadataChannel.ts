import urlcat from 'urlcat';

import type { SocialSourceInURL } from '@/constants/enum.js';
import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createPageTitle, createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

export async function createMetadataChannel(channelId: string) {
    const source = Source.Farcaster; // TODO: channel only farcaster
    const provider = resolveSocialMediaProvider(source);
    const channel = await provider.getChannelById(channelId).catch(() => null);
    if (!channel) return createSiteMetadata({});
    const title = createPageTitleOG(channel.name);
    const description = channel.description;
    const images = [channel.imageUrl];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            type: 'profile',
            url: resolveChannelUrl(channelId),
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}

export async function createMetadataChannelById(source: SocialSourceInURL, channelId: string) {
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
