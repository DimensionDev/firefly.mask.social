import type { SocialSourceInURL } from '@/constants/enum.js';
import { createPageTitle, createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isSocialSourceInUrl } from '@/helpers/isSocialSource.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

export async function createMetadataChannel(source: SocialSourceInURL, channelId: string) {
    if (!isSocialSourceInUrl(source)) return createSiteMetadata();

    const socialSource = resolveSocialSource(source);
    const provider = resolveSocialMediaProvider(socialSource);
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
            url: resolveChannelUrl(channelId, undefined, socialSource),
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
    if (!isSocialSourceInUrl(source)) return createSiteMetadata();

    const socialSource = resolveSocialSource(source);
    const provider = resolveSocialMediaProvider(socialSource);
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
            url: resolveChannelUrl(channel.id, undefined, socialSource),
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
