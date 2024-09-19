import { Source } from '@/constants/enum.js';
import { createPageTitleV2 } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

export async function getChannelOG(channelId: string) {
    const source = Source.Farcaster; // TODO: channel only farcaster
    const provider = resolveSocialMediaProvider(source);
    const channel = await provider.getChannelById(channelId).catch(() => null);
    if (!channel) return createSiteMetadata({});
    const title = createPageTitleV2(channel.name);
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
