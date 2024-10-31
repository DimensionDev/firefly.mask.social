import type { Metadata } from 'next';
import { redirect } from 'next/navigation.js';

import { ChannelTabType, KeyType, type SocialSourceInURL } from '@/constants/enum.js';
import { createMetadataChannelById } from '@/helpers/createMetadataChannel.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';

const createPageMetadata = memoizeWithRedis(createMetadataChannelById, {
    key: KeyType.CreateMetadataChannelById,
});

interface Props {
    params: {
        id: string;
    };
    searchParams: {
        source: SocialSourceInURL;
        channel_tab?: ChannelTabType;
    };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (searchParams.source) return createPageMetadata(searchParams.source, params.id);
    return createSiteMetadata();
}

export default function Page({ params, searchParams }: Props) {
    if (isBotRequest()) return null;

    const type =
        searchParams.channel_tab && [ChannelTabType.Recent, ChannelTabType.Trending].includes(searchParams.channel_tab)
            ? searchParams.channel_tab
            : ChannelTabType.Recent;
    redirect(resolveChannelUrl(params.id, type));
}
