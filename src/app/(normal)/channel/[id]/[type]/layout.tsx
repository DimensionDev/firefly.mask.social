import { notFound } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { ChannelLayout } from '@/app/(normal)/channel/pages/ChannelLayout.js';
import { ChannelTabType, Source } from '@/constants/enum.js';
import { createMetadataChannel } from '@/helpers/createMetadataChannel.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

export const revalidate = 60;

type Props = PropsWithChildren<{
    params: {
        id: string;
        type: ChannelTabType;
    };
}>;

export async function generateMetadata({ params }: Props) {
    return createMetadataChannel(params.id);
}

export default async function Layout({ params, children }: Props) {
    const source = Source.Farcaster; // TODO: channel only farcaster
    const provider = resolveSocialMediaProvider(source);
    const channel = await provider.getChannelById(params.id).catch(() => null);

    if (!channel) return notFound();

    return (
        <ChannelLayout channel={channel} id={params.id} type={params.type}>
            {children}
        </ChannelLayout>
    );
}
