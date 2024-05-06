'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ChannelPage } from '@/app/(normal)/pages/Channel.js';
import { Loading } from '@/components/Loading.js';
import type { SourceInURL } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSource } from '@/helpers/resolveSource.js';

interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        source: SourceInURL;
    };
}

export function ChannelDetailPage({ params: { id: channelId }, searchParams: { source } }: PageProps) {
    const currentSource = resolveSource(source);

    const { data: channel = null, isLoading } = useQuery({
        queryKey: ['channel', currentSource, channelId],
        queryFn: () => {
            const provider = resolveSocialMediaProvider(currentSource);
            return provider.getChannelById(channelId);
        },
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!channel) {
        notFound();
    }

    return <ChannelPage channel={channel} />;
}
