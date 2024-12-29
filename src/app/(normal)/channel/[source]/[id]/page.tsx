import type { Metadata } from 'next';
import { redirect } from 'next/navigation.js';

import { ChannelTabType, KeyType, type SocialSourceInURL, SourceInURL } from '@/constants/enum.js';
import { createMetadataChannelById } from '@/helpers/createMetadataChannel.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { isSocialSourceInUrl } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

const createPageMetadata = memoizeWithRedis(createMetadataChannelById, {
    key: KeyType.CreateMetadataChannelById,
});

interface Props {
    params: Promise<{
        id: string;
        source: SocialSourceInURL;
    }>;
    searchParams: Promise<{
        source: SocialSourceInURL;
        channel_tab?: ChannelTabType;
    }>;
}

function isChannelTabType(value?: string): value is ChannelTabType {
    return Object.values(ChannelTabType).includes(value as ChannelTabType);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const source = isChannelTabType(params.id) ? searchParams.source : params.source;
    const id = isChannelTabType(params.id) ? searchParams.source : params.id;
    return createPageMetadata(source || SourceInURL.Farcaster, id);
}

export default async function Page(props: Props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    if (await isBotRequest()) return null;

    const sourceFromQuery = isSocialSourceInUrl(searchParams.source)
        ? resolveSocialSource(searchParams.source)
        : undefined;
    const typeFromQuery = isChannelTabType(searchParams.channel_tab) ? searchParams.channel_tab : undefined;

    if (isChannelTabType(params.id)) {
        // /channel/:id/:type
        redirect(resolveChannelUrl(params.source, params.id, sourceFromQuery));
    } else {
        redirect(
            resolveChannelUrl(
                params.id,
                typeFromQuery,
                isSocialSourceInUrl(params.source) ? resolveSocialSource(params.source) : undefined,
            ),
        );
    }
}
